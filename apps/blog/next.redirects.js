/**
 * @type {import('next').NextConfig['redirects']}
 */
const redirects = async () => [
  {
    source: '/categories',
    destination: '/category',
    permanent: true,
  },
  {
    source: '/page/:id',
    destination: '/?page=:id',
    permanent: true,
  },
  {
    source: '/pages/:id',
    destination: '/:id',
    permanent: true,
  },
  {
    source: '/stats',
    destination: 'https://insights.duyet.net',
    permanent: true,
  },
  {
    // Non-html to .html blog post
    source: '/:year/:month/:slug/',
    destination: '/:year/:month/:slug.html',
    permanent: true,
  },
  {
    source: '/series/clickhouse',
    destination: '/series/clickhouse-on-kubernetes',
    permanent: true,
  },
  {
    source: '/2015/01/git-phuc-hoi-code-cu-toan-tap.html',
    destination: '/2015/01/git-recovering-old-code.html',
    permanent: true,
  },
  {
    source: '/2015/01/su-dung-expressjs-de-hien-thi-noi-dung.html',
    destination: '/2015/01/expressjs-static-html.html',
    permanent: true,
  },
  {
    source: '/2015/02/coding-nhung-loi-ich-cua-viec-tiep-can.html',
    destination: '/2015/01/module.html',
    permanent: true,
  },
  {
    source: '/2015/02/dns-la-cai-quai-gi-vay.html',
    destination: '/2015/01/dns.html',
    permanent: true,
  },
  {
    source: '/2015/02/nodejs-packagejson-la-gi-vay.html',
    destination: '/2015/02/packagejson.html',
    permanent: true,
  },
  {
    source: '/2015/02/quy-trinh-phat-trien-phan-mem-mo-hinh-thac-nuoc.html',
    destination: '/2015/02/waterfall.html',
    permanent: true,
  },
  {
    source: '/2015/02/quy-trinh-phat-trien-phan-mem-mo-hinh-xoan-oc.html',
    destination: '/2015/02/spiral.html',
    permanent: true,
  },
  {
    source: '/2015/02/oop-design-patterns-la-gi.html',
    destination: '/2015/02/design-patterns.html',
    permanent: true,
  },
  {
    source: '/2015/02/gioi-thieu-lam-quen-voi-phpmyadmin-he.html',
    destination: '/2015/02/phpmyadmin.html',
    permanent: true,
  },
]

module.exports = redirects
