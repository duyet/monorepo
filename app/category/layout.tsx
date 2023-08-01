import Container from '../../components/Container';

export default function Layout({ children }) {
  return (
    <Container>
      <div className="mb-10">{children}</div>
    </Container>
  );
}
