import { useToast } from './useToast'

export const useExport = () => {
  const { success, error } = useToast()

  const exportToCSV = (data, filename = 'termlytic-export.csv') => {
    try {
      if (!data || data.length === 0) {
        error('No data to export')
        return
      }

      // Get headers from first object
      const headers = Object.keys(data[0])

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...data.map(row =>
          headers.map(header => {
            const value = row[header]
            // Escape values containing commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          }).join(',')
        )
      ].join('\n')

      // Create download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      success('CSV exported successfully')
    } catch (err) {
      console.error('Export to CSV failed:', err)
      error('Failed to export CSV')
    }
  }

  const exportToJSON = (data, filename = 'termlytic-export.json') => {
    try {
      if (!data) {
        error('No data to export')
        return
      }

      const jsonContent = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      success('JSON exported successfully')
    } catch (err) {
      console.error('Export to JSON failed:', err)
      error('Failed to export JSON')
    }
  }

  const exportToPDF = async (elementId, filename = 'termlytic-report.pdf') => {
    try {
      // This would require a PDF library like jsPDF or html2pdf
      // For now, we'll show a message
      error('PDF export coming soon!')
    } catch (err) {
      console.error('Export to PDF failed:', err)
      error('Failed to export PDF')
    }
  }

  return {
    exportToCSV,
    exportToJSON,
    exportToPDF
  }
}
