module.exports = {
  '*.+(json|css|less|scss|md|gql|graphql|mdx|vue)': [
    `kcd-scripts format`,
  ],
  '*.+(js|jsx|mjs|cjs|ts|tsx|mts|cts)': [
    `eslint --fix`,
    `jest --findRelatedTests --passWithNoTests`,
  ],
}
