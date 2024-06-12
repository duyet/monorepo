interface TextDataSourceProps {
  children: React.ReactNode;
}

export function TextDataSource({ children }: TextDataSourceProps) {
  return (
    <div className="mt-5 text-right text-xs italic text-gray-400">
      Source: {children}
    </div>
  );
}

export default TextDataSource;
