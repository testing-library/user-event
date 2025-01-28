module.exports = {
  '*.+(json|yml|yaml|css|less|scss|md|gql|graphql|mdx|vue)': [
    `kcd-scripts format`,
  ],
  '*.+(js|jsx|mjs|cjs|ts|tsx|mts|cts)': [
    `eslint --fix`,
    `kcd-scripts test --findRelatedTests --passWithNoTests`,
  ],
}
