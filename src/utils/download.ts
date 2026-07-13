import { ElMessage } from 'element-plus'

/**
 * Download a binary file from the given URL using fetch + Blob.
 *
 * Unlike a bare `<a href>` click, this works reliably inside iframes,
 * sandboxed previews, and cross-origin proxy contexts because the
 * actual download is triggered from a same-origin blob: URL — no
 * top-level navigation required.
 *
 * Falls back to `window.open(url)` if the fetch itself fails (e.g.
 * network error), so the user still gets *something*.
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      const text = await res.text().catch(() => `HTTP ${res.status}`)
      ElMessage.error(`下载失败: ${text}`)
      return
    }
    const blob = await res.blob()
    if (blob.size <= 24) {
      // A pcap global header is 24 bytes — means zero matching packets.
      ElMessage.warning('未匹配到任何数据包（文件为空）')
      return
    }
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    // Revoke after a short delay to let the browser start the save dialog.
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
    ElMessage.success('下载已开始')
  } catch (err: any) {
    console.warn('downloadFile: fetch failed, falling back to window.open', err)
    ElMessage.warning('直接下载失败，尝试新窗口打开…')
    window.open(url, '_blank')
  }
}
