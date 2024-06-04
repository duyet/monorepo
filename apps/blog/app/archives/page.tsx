import Container from '@duyet/components/Container';
import YearList from '@duyet/components/YearList';
import { getPostsByAllYear } from '@duyet/libs/getPost';
import { Year } from '../../components/year';

export default function Archives() {
  const yearLimit = 5;
  const postsByYear = getPostsByAllYear(
    ['slug', 'title', 'date', 'category'],
    yearLimit,
  );

  return (
    <Container>
      <div>
        {Object.keys(postsByYear)
          .sort((a: string, b: string) => parseInt(b) - parseInt(a))
          .map((year: string) => (
            <Year key={year} year={parseInt(year)} />
          ))}
      </div>

      <div className="border-top-1 mt-10">
        <YearList />
      </div>
    </Container>
  );
}
