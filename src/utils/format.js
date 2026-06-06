/**
 * Format angka menjadi Rupiah (IDR)
 * @param {number} angka - Nominal yang ingin diformat
 * @returns {string} String dalam format "Rp X.XXX"
 */
export const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka)
}

/**
 * Map status backend ke label frontend (bahasa Indonesia)
 * @param {string} backendStatus - Status dari API (PENDING, APPROVED, REJECTED, PAID)
 * @returns {string} Status frontend
 */
export const mapStatusToFrontend = (backendStatus) => {
  const status = backendStatus?.toUpperCase() || ''
  if (status === 'PENDING') return 'menunggu'
  if (status === 'APPROVED') return 'diterima'
  if (status === 'REJECTED') return 'ditolak'
  if (status === 'PAID') return 'dibayar'
  return 'menunggu'
}
