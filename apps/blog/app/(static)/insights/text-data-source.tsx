interface TextDataSourceProps {
  children: React.ReactNode
}

export default function TextDataSource({ children }: TextDataSourceProps) {
  return (
    <div className="text-sm italic text-gray-400 text-right mt-5">
      Source: {children}
    </div>
  )
}
