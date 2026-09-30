import { Article, DynamicLawDataset, LawMetadata } from '../types/law';

export class RegulationScraperService {
  private async fetchWithTimeout(url: string, timeout = 8000, signal?: AbortSignal): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    // If external signal is aborted, abort ours too
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (err: any) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        throw new Error('Koneksi Terputus atau Timeout');
      }
      throw err;
    }
  }

  public async scrapeLaw(url: string, metadataParams: Partial<LawMetadata>, abortSignal?: AbortSignal): Promise<DynamicLawDataset> {
    const response = await this.fetchWithTimeout(url, 8000, abortSignal);
    
    if (!response.ok) {
      throw new Error(`Gagal mengunduh: HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    let pasalList: Article[] = [];

    if (contentType.includes('application/json') || url.endsWith('.json')) {
      const data = await response.json();
      pasalList = this.validateAndFilterJSON(data);
    } else {
      const htmlText = await response.text();
      pasalList = this.parseHTML(htmlText, metadataParams.id || 'law');
    }

    const metadata: LawMetadata = {
      id: metadataParams.id || `law-${Date.now()}`,
      judul: metadataParams.judul || 'Regulasi Tanpa Judul',
      nomor: metadataParams.nomor || '-',
      tahun: metadataParams.tahun || new Date().getFullYear(),
      kategori: metadataParams.kategori || 'khusus',
      sumberUrl: url,
      statusDownload: 'online-only',
      totalPasal: pasalList.length,
      ...metadataParams,
    };

    return {
      metadata,
      pasalList
    };
  }

  private validateAndFilterJSON(data: any): Article[] {
    // Expecting data to be an array of articles or have a pasalList property
    const list = Array.isArray(data) ? data : data.pasalList;
    if (!Array.isArray(list)) {
      throw new Error('Format JSON tidak valid: gagal menemukan array pasal.');
    }
    
    // Basic validation
    return list.map(item => ({
      id: item.id || `pasal-${Math.random().toString(36).substr(2, 9)}`,
      lawId: item.lawId || 'unknown',
      nomor: item.nomor?.toString() || '',
      isi: item.isi || '',
      kategori: item.kategori || 'khusus',
      bab: item.bab || '',
      judul: item.judul || '',
      penjelasan: item.penjelasan || '',
      ayat: item.ayat || []
    })).filter(a => a.nomor && a.isi);
  }

  private parseHTML(html: string, lawId: string): Article[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const articles: Article[] = [];
    
    // Simple heuristic parser for Indonesian Laws HTML
    // Looking for elements that denote Bab, Bagian, Pasal
    const elements = doc.body.querySelectorAll('h1, h2, h3, h4, h5, p, div.pasal, div.bab');
    
    let currentBab = '';
    let currentBagian = '';
    let currentArticle: Article | null = null;
    
    elements.forEach((el) => {
      const text = el.textContent?.trim() || '';
      const lowerText = text.toLowerCase();

      if (lowerText.startsWith('bab ')) {
        currentBab = text;
      } else if (lowerText.startsWith('bagian ')) {
        currentBagian = text;
      } else if (lowerText.startsWith('pasal ')) {
        if (currentArticle) {
          articles.push(currentArticle);
        }

        const match = lowerText.match(/pasal\s+([0-9]+(?:\s*[a-z]+|\s+bis)?)/i);
        const nomor = match ? match[1].trim().replace(/\s+([a-zA-Z])$/, '$1').toUpperCase() : `X-${Math.floor(Math.random() * 1000)}`;
        const slug = nomor.toLowerCase().replace(/[^a-z0-9]/g, '-');

        currentArticle = {
          id: `${lawId}-pasal-${slug}`,
          lawId: lawId,
          nomor: nomor,
          bab: currentBab,
          bagian: currentBagian,
          isi: text.replace(new RegExp(`^pasal\\s+${match ? match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : nomor}\\s*[:.-]?\\s*`, 'i'), ''),
          kategori: 'khusus',
          ayat: [],
        };
      } else if (currentArticle) {
        const ayatMatch = text.match(/^\(([0-9]+)\)\s*(.*)/);
        if (ayatMatch) {
          currentArticle.ayat!.push({
            nomor: parseInt(ayatMatch[1], 10),
            teks: text,
          });
          currentArticle.isi += `\n${text}`;
        } else if (lowerText.startsWith('penjelasan')) {
          currentArticle.penjelasan = text;
        } else {
          currentArticle.isi += `\n${text}`;
        }
      }
    });

    if (currentArticle) {
      articles.push(currentArticle);
    }

    if (articles.length === 0) {
      throw new Error('Gagal mengekstrak pasal dari HTML (struktur tidak dikenali).');
    }

    return articles;
  }

  public parseRawText(rawText: string, metadataParams: Partial<LawMetadata>): DynamicLawDataset {
    const trimmed = rawText.trim();
    if (!trimmed) {
      throw new Error('Teks naskah kosong.');
    }

    const lawId = metadataParams.id || `law-${Date.now()}`;
    let pasalList: Article[] = [];

    // Check if user pasted JSON
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsedJson = JSON.parse(trimmed);
        pasalList = this.validateAndFilterJSON(parsedJson).map((a) => ({
          ...a,
          lawId: a.lawId === 'unknown' ? lawId : a.lawId,
        }));
      } catch {
        // Not valid JSON, proceed as plain text
      }
    }

    if (pasalList.length === 0) {
      const lines = trimmed.split(/\r?\n/);
      let currentBab = '';
      let currentBagian = '';
      let currentArticle: Article | null = null;
      let awaitingBabTitle = false;
      let awaitingBagianTitle = false;

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        const lower = trimmedLine.toLowerCase();

        // 1. Bab detection and continuation
        if (lower.startsWith('bab ')) {
          if (currentArticle) {
            pasalList.push(currentArticle);
            currentArticle = null;
          }
          currentBab = trimmedLine;
          awaitingBabTitle = true;
          continue;
        }

        if (awaitingBabTitle) {
          if (!lower.startsWith('bagian ') && !lower.startsWith('pasal ')) {
            currentBab = `${currentBab} - ${trimmedLine}`;
            awaitingBabTitle = false;
            continue;
          }
          awaitingBabTitle = false;
        }

        // 2. Bagian detection and continuation
        if (lower.startsWith('bagian ')) {
          if (currentArticle) {
            pasalList.push(currentArticle);
            currentArticle = null;
          }
          currentBagian = trimmedLine;
          awaitingBagianTitle = true;
          continue;
        }

        if (awaitingBagianTitle) {
          if (!lower.startsWith('bab ') && !lower.startsWith('pasal ')) {
            currentBagian = `${currentBagian} - ${trimmedLine}`;
            awaitingBagianTitle = false;
            continue;
          }
          awaitingBagianTitle = false;
        }

        // 3. Pasal detection (handles standard e.g. "Pasal 1", plus "Pasal 1A", "Pasal 14 bis", "Pasal 27 B")
        if (lower.startsWith('pasal ')) {
          if (currentArticle) {
            pasalList.push(currentArticle);
          }
          const match = lower.match(/^pasal\s+([0-9]+(?:\s*[a-z]+|\s+bis)?)/i);
          const rawMatch = match ? match[1] : `${pasalList.length + 1}`;
          const nomor = rawMatch.trim().replace(/\s+([a-zA-Z])$/, '$1').toUpperCase();
          const nomorSlug = nomor.toLowerCase().replace(/[^a-z0-9]/g, '-');

          const contentAfterPasal = trimmedLine.replace(
            new RegExp(`^pasal\\s+${rawMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:.-]?\\s*`, 'i'),
            ''
          );

          currentArticle = {
            id: `${lawId}-pasal-${nomorSlug}`,
            lawId,
            nomor,
            bab: currentBab,
            bagian: currentBagian,
            isi: contentAfterPasal,
            kategori: metadataParams.kategori || 'khusus',
            ayat: [],
          };

          // If contentAfterPasal starts with an ayat like (1)
          const directAyatMatch = contentAfterPasal.match(/^\(([0-9]+)\)\s*(.*)/);
          if (directAyatMatch) {
            currentArticle.ayat!.push({
              nomor: parseInt(directAyatMatch[1], 10),
              teks: contentAfterPasal,
            });
          }
        } else if (currentArticle) {
          // Content continuation for current article
          const ayatMatch = trimmedLine.match(/^\(([0-9]+)\)\s*(.*)/);
          if (ayatMatch) {
            currentArticle.ayat!.push({
              nomor: parseInt(ayatMatch[1], 10),
              teks: trimmedLine,
            });
            currentArticle.isi = currentArticle.isi ? `${currentArticle.isi}\n${trimmedLine}` : trimmedLine;
          } else if (lower.startsWith('penjelasan')) {
            currentArticle.penjelasan = trimmedLine;
          } else {
            currentArticle.isi = currentArticle.isi ? `${currentArticle.isi}\n${trimmedLine}` : trimmedLine;
          }
        }
      }

      if (currentArticle) {
        pasalList.push(currentArticle);
      }

      // If no "Pasal" was matched, treat the whole text as single article (Pasal 1)
      if (pasalList.length === 0) {
        pasalList.push({
          id: `${lawId}-pasal-1`,
          lawId,
          nomor: '1',
          bab: currentBab || 'UMUM',
          isi: trimmed,
          kategori: metadataParams.kategori || 'khusus',
          ayat: [],
        });
      }
    }

    const metadata: LawMetadata = {
      id: lawId,
      judul: metadataParams.judul || 'Regulasi Tanpa Judul',
      nomor: metadataParams.nomor || '-',
      tahun: metadataParams.tahun || new Date().getFullYear(),
      kategori: metadataParams.kategori || 'khusus',
      sumberUrl: metadataParams.sumberUrl || 'Naskah Langsung (Ingestion)',
      statusDownload: 'cached-offline',
      totalPasal: pasalList.length,
      ...metadataParams,
    };

    return {
      metadata,
      pasalList,
    };
  }
}

export const regulationScraper = new RegulationScraperService();
