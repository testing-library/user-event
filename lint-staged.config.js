module.exports = {
  '*.+(js|jsx|json|yml|yaml|css|less|scss|ts|tsx|md|gql|graphql|mdx|vue)': [
    `kcd-scripts format`,
    `eslint`,
    `kcd-scripts test --findRelatedTests`,
  ],
}
