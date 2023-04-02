const getSlug = (name: string) => {
  return name.toLowerCase().replace(/ /g, '-')
}

export default getSlug
