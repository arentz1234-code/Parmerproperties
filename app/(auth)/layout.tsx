export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D3561] to-[#1f2547] flex items-center justify-center p-4">
      {children}
    </div>
  )
}
