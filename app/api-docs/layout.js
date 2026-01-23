// Custom layout for API docs - removes header/footer
export default function ApiDocsLayout({ children }) {
  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      background: 'white',
      overflow: 'auto'
    }}>
      {children}
    </div>
  )
}
