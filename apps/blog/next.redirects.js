/**
 * @type {import('next').NextConfig['redirects']}
 */
const redirects = async () => [
  {
    source: "/categories",
    destination: "/category",
    permanent: true,
  },
  {
    source: "/page/:id",
    destination: "/?page=:id",
    permanent: true,
  },
  {
    source: "/pages/:id",
    destination: "/:id",
    permanent: true,
  },
  {
    source: "/stats",
    destination: "https://insights.duyet.net",
    permanent: true,
  },
  {
    // Non-html to .html blog post
    source: "/:year/:month/:slug/",
    destination: "/:year/:month/:slug.html",
    permanent: true,
  },
  {
    source: "/series/clickhouse",
    destination: "/series/clickhouse-on-kubernetes",
    permanent: true,
  },
  {
    source: "/2015/01/git-phuc-hoi-code-cu-toan-tap.html",
    destination: "/2015/01/git-recovering-old-code.html",
    permanent: true,
  },
  {
    source: "/2015/01/su-dung-expressjs-de-hien-thi-noi-dung.html",
    destination: "/2015/01/expressjs-static-html.html",
    permanent: true,
  },
  {
    source: "/2015/02/coding-nhung-loi-ich-cua-viec-tiep-can.html",
    destination: "/2015/01/module.html",
    permanent: true,
  },
  {
    source: "/2015/02/dns-la-cai-quai-gi-vay.html",
    destination: "/2015/01/dns.html",
    permanent: true,
  },
  {
    source: "/2015/02/nodejs-packagejson-la-gi-vay.html",
    destination: "/2015/02/packagejson.html",
    permanent: true,
  },
  {
    source: "/2015/02/quy-trinh-phat-trien-phan-mem-mo-hinh-thac-nuoc.html",
    destination: "/2015/02/waterfall.html",
    permanent: true,
  },
  {
    source: "/2015/02/quy-trinh-phat-trien-phan-mem-mo-hinh-xoan-oc.html",
    destination: "/2015/02/spiral.html",
    permanent: true,
  },
  {
    source: "/2015/02/oop-design-patterns-la-gi.html",
    destination: "/2015/02/design-patterns.html",
    permanent: true,
  },
  {
    source: "/2015/02/gioi-thieu-lam-quen-voi-phpmyadmin-he.html",
    destination: "/2015/02/phpmyadmin.html",
    permanent: true,
  },
  {
    source: "/2015/12/chartico-tao-bieu-o-cot-nhanh-chong-va.html",
    destination: "/2015/12/chartico.html",
    permanent: true,
  },
  {
    source: "/2015/12/docker-la-gi-co-ban-ve-docker.html",
    destination: "/2015/12/docker.html",
    permanent: true,
  },
  {
    source: "/2015/11/review-trai-nghiem-firefox-os.html",
    destination: "/2015/11/firefox-os.html",
    permanent: true,
  },
  {
    source: "/2015/09/nodejs-all-you-need-to-know-about.html",
    destination: "/2015/09/all-you-need-to-know-about-nodejs.html",
    permanent: true,
  },
  {
    source: "/2015/04/project-mongo-web-query-simple.html",
    destination: "/2015/04/mongo-web-query.html",
    permanent: true,
  },
  {
    source: "/2015/04/database-tim-hieu-ve-csdl-redis.html",
    destination: "/2015/04/redis.html",
    permanent: true,
  },
  {
    source: "/2015/04/bootstrap-gioi-thieu-ve-components.html",
    destination: "/2015/04/bootstrap.html",
    permanent: true,
  },
  {
    source: "/2015/04/bigdata-getting-started-with-spark-in-python.html",
    destination: "/2015/04/pyspark.html",
    permanent: true,
  },
];

module.exports = redirects;
