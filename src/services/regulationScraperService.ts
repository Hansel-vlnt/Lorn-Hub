import type { Article, DynamicLawDataset, LawMetadata } from '../types/law';

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
        throw new Error('Koneksi Terputus atau Timeout (maksimal 8 detik).');
      }
      if (err.name === 'TypeError' || (err.message && err.message.toLowerCase().includes('fetch'))) {
        throw new Error('Koneksi gagal atau terhalang kebijakan CORS browser. Pastikan URL dapat diakses atau gunakan opsi Input Teks Langsung.');
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

  public parseHTML(html: string, lawId: string): Article[] {
    if (typeof DOMParser === 'undefined') {
      const stripped = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, '\n')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      return this.parseRawText(stripped, { id: lawId }).pasalList;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove non-content elements
    doc.querySelectorAll('script, style, noscript, nav, header, footer').forEach((el) => el.remove());

    const articles: Article[] = [];
    const elements = doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote');

    let currentBab = '';
    let currentBagian = '';
    let currentParagraf = '';
    let currentArticle: Article | null = null;
    let awaitingBabTitle = false;
    let awaitingBagianTitle = false;
    let awaitingParagrafTitle = false;

    elements.forEach((el) => {
      const text = el.textContent?.trim() || '';
      if (!text) return;
      const lower = text.toLowerCase();

      // Skip elements that contain child headings/paragraphs to avoid duplicate parsing
      if (el.querySelector('h1, h2, h3, h4, h5, h6, p')) {
        return;
      }

      if (lower.startsWith('bab ')) {
        if (currentArticle) {
          articles.push(currentArticle);
          currentArticle = null;
        }
        currentBab = text;
        currentBagian = '';
        currentParagraf = '';
        awaitingBabTitle = true;
        return;
      }

      if (awaitingBabTitle) {
        if (!lower.startsWith('bagian ') && !lower.startsWith('paragraf ') && !lower.startsWith('pasal ')) {
          currentBab = `${currentBab} - ${text}`;
          awaitingBabTitle = false;
          return;
        }
        awaitingBabTitle = false;
      }

      if (lower.startsWith('bagian ')) {
        if (currentArticle) {
          articles.push(currentArticle);
          currentArticle = null;
        }
        currentBagian = text;
        currentParagraf = '';
        awaitingBagianTitle = true;
        return;
      }

      if (awaitingBagianTitle) {
        if (!lower.startsWith('bab ') && !lower.startsWith('paragraf ') && !lower.startsWith('pasal ')) {
          currentBagian = `${currentBagian} - ${text}`;
          awaitingBagianTitle = false;
          return;
        }
        awaitingBagianTitle = false;
      }

      if (lower.startsWith('paragraf ')) {
        if (currentArticle) {
          articles.push(currentArticle);
          currentArticle = null;
        }
        currentParagraf = text;
        awaitingParagrafTitle = true;
        return;
      }

      if (awaitingParagrafTitle) {
        if (!lower.startsWith('bab ') && !lower.startsWith('bagian ') && !lower.startsWith('pasal ')) {
          currentParagraf = `${currentParagraf} - ${text}`;
          awaitingParagrafTitle = false;
          return;
        }
        awaitingParagrafTitle = false;
      }

      if (lower.startsWith('pasal ')) {
        if (currentArticle) {
          articles.push(currentArticle);
        }

        const match = lower.match(/^pasal\s+([0-9]+(?:\s*[a-z]+|\s+bis)?)/i);
        const rawMatch = match ? match[1] : `${articles.length + 1}`;
        const nomor = rawMatch.trim().replace(/\s+([a-zA-Z])$/, '$1').toUpperCase();
        const slug = nomor.toLowerCase().replace(/[^a-z0-9]/g, '-');

        const lineWithoutPasal = text.replace(
          new RegExp(`^pasal\\s+${rawMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'),
          ''
        );

        let judul: string | undefined = undefined;
        let contentAfterPasal = lineWithoutPasal;
        const titleMatch = lineWithoutPasal.match(/^[:–-]\s*([^(]+)/);
        if (titleMatch && titleMatch[1].trim().length < 80) {
          judul = titleMatch[1].trim();
          contentAfterPasal = lineWithoutPasal.slice(titleMatch[0].length).trim();
        } else {
          contentAfterPasal = lineWithoutPasal.replace(/^[:.-]\s*/, '');
        }

        currentArticle = {
          id: `${lawId}-pasal-${slug}`,
          lawId,
          nomor,
          judul,
          bab: currentBab,
          bagian: currentBagian,
          paragraf: currentParagraf,
          isi: contentAfterPasal,
          kategori: 'khusus',
          ayat: [],
        };

        const directAyatMatch = contentAfterPasal.match(/^\(([0-9]+)\)\s*(.*)/);
        if (directAyatMatch) {
          currentArticle.ayat!.push({
            nomor: parseInt(directAyatMatch[1], 10),
            teks: contentAfterPasal,
          });
        }
      } else if (currentArticle) {
        const ayatMatch = text.match(/^\(([0-9]+)\)\s*(.*)/);
        if (ayatMatch) {
          currentArticle.ayat!.push({
            nomor: parseInt(ayatMatch[1], 10),
            teks: text,
          });
          currentArticle.isi = currentArticle.isi ? `${currentArticle.isi}\n${text}` : text;
        } else if (lower.startsWith('penjelasan')) {
          currentArticle.penjelasan = text;
        } else {
          currentArticle.isi = currentArticle.isi ? `${currentArticle.isi}\n${text}` : text;
        }
      }
    });

    if (currentArticle) {
      articles.push(currentArticle);
    }

    if (articles.length === 0) {
      const fullText = doc.body.textContent?.trim() || '';
      if (fullText) {
        return [{
          id: `${lawId}-pasal-1`,
          lawId,
          nomor: '1',
          bab: currentBab || 'UMUM',
          isi: fullText,
          kategori: 'khusus',
          ayat: [],
        }];
      }
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

    // Check if user pasted HTML
    if (trimmed.includes('<html') || trimmed.includes('<body') || (trimmed.startsWith('<') && trimmed.includes('>'))) {
      const articles = this.parseHTML(trimmed, lawId);
      return {
        metadata: {
          id: lawId,
          judul: metadataParams.judul || 'Regulasi Tanpa Judul',
          nomor: metadataParams.nomor || '-',
          tahun: metadataParams.tahun || new Date().getFullYear(),
          kategori: metadataParams.kategori || 'khusus',
          sumberUrl: metadataParams.sumberUrl || 'Naskah Langsung (Ingestion)',
          statusDownload: 'cached-offline',
          totalPasal: articles.length,
          ...metadataParams,
        },
        pasalList: articles,
      };
    }

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
      // Auto-normalize legal headings (e.g. from single-line PDF dumps or unformatted text)
      const normalized = trimmed
        .replace(/([^\n])\s+(BAB\s+[IVXLCDM]+(?:\s+[^.\n]+)?)/gi, '$1\n\n$2\n')
        .replace(/([^\n])\s+(BAGIAN\s+[A-Z\s]+)/gi, '$1\n\n$2\n')
        .replace(/([^\n])\s+(PARAGRAF\s+\d+)/gi, '$1\n\n$2\n')
        .replace(/([^\n])\s+(Pasal\s+\d+(?:\s*[a-zA-Z]+|\s+bis)?)/gi, '$1\n\n$2')
        .replace(/([^\n])\s+(\([0-9]+\)\s+[A-Z])/g, '$1\n$2');

      const lines = normalized.split(/\r?\n/);
      let currentBab = '';
      let currentBagian = '';
      let currentParagraf = '';
      let currentArticle: Article | null = null;
      let awaitingBabTitle = false;
      let awaitingBagianTitle = false;
      let awaitingParagrafTitle = false;

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
          currentBagian = '';
          currentParagraf = '';
          awaitingBabTitle = true;
          continue;
        }

        if (awaitingBabTitle) {
          if (!lower.startsWith('bagian ') && !lower.startsWith('paragraf ') && !lower.startsWith('pasal ')) {
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
          currentParagraf = '';
          awaitingBagianTitle = true;
          continue;
        }

        if (awaitingBagianTitle) {
          if (!lower.startsWith('bab ') && !lower.startsWith('paragraf ') && !lower.startsWith('pasal ')) {
            currentBagian = `${currentBagian} - ${trimmedLine}`;
            awaitingBagianTitle = false;
            continue;
          }
          awaitingBagianTitle = false;
        }

        // 3. Paragraf detection and continuation
        if (lower.startsWith('paragraf ')) {
          if (currentArticle) {
            pasalList.push(currentArticle);
            currentArticle = null;
          }
          currentParagraf = trimmedLine;
          awaitingParagrafTitle = true;
          continue;
        }

        if (awaitingParagrafTitle) {
          if (!lower.startsWith('bab ') && !lower.startsWith('bagian ') && !lower.startsWith('pasal ')) {
            currentParagraf = `${currentParagraf} - ${trimmedLine}`;
            awaitingParagrafTitle = false;
            continue;
          }
          awaitingParagrafTitle = false;
        }

        // 4. Pasal detection (handles standard e.g. "Pasal 1", plus "Pasal 1A", "Pasal 14 bis", "Pasal 27 B")
        if (lower.startsWith('pasal ')) {
          // Exclude cross-references e.g. "Pasal 5 ayat (1)", "Pasal 28 Undang-Undang Dasar"
          if (/^pasal\s+\d+\s*(?:ayat|jo|tentang|nomor|huruf|angka|undang-undang)/i.test(lower)) {
            if (currentArticle) {
              currentArticle.isi = currentArticle.isi ? `${currentArticle.isi}\n${trimmedLine}` : trimmedLine;
            }
            continue;
          }

          if (currentArticle) {
            pasalList.push(currentArticle);
          }
          const match = lower.match(/^pasal\s+([0-9]+(?:\s*(?:[a-zA-Z]\b|bis\b))?)/i);
          const rawMatch = match ? match[1] : `${pasalList.length + 1}`;
          const nomor = rawMatch.trim().replace(/\s+([a-zA-Z])$/, '$1').toUpperCase();
          const nomorSlug = nomor.toLowerCase().replace(/[^a-z0-9]/g, '-');

          const lineWithoutPasal = trimmedLine.replace(
            new RegExp(`^pasal\\s+${rawMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'),
            ''
          );

          let judul: string | undefined = undefined;
          let contentAfterPasal = lineWithoutPasal;
          const titleMatch = lineWithoutPasal.match(/^[:–-]\s*([^(]+)/);
          if (titleMatch && titleMatch[1].trim().length < 80) {
            judul = titleMatch[1].trim();
            contentAfterPasal = lineWithoutPasal.slice(titleMatch[0].length).trim();
          } else {
            contentAfterPasal = lineWithoutPasal.replace(/^[:.-]\s*/, '');
          }

          currentArticle = {
            id: `${lawId}-pasal-${nomorSlug}`,
            lawId,
            nomor,
            judul,
            bab: currentBab,
            bagian: currentBagian,
            paragraf: currentParagraf,
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
