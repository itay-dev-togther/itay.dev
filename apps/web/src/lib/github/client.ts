import { Octokit } from '@octokit/rest'

// GitHub App or PAT token for server-side operations
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

if (!GITHUB_TOKEN) {
  console.warn('GITHUB_TOKEN not set - GitHub operations will fail')
}

export const octokit = new Octokit({
  auth: GITHUB_TOKEN,
})

// Organization or user where repos are created
export const GITHUB_OWNER = process.env.GITHUB_OWNER || 'itay-dev'

export interface CreateRepoFromTemplateOptions {
  templateOwner: string
  templateRepo: string
  name: string
  description?: string
  isPrivate?: boolean
}

export async function createRepoFromTemplate({
  templateOwner,
  templateRepo,
  name,
  description,
  isPrivate = false,
}: CreateRepoFromTemplateOptions) {
  const response = await octokit.repos.createUsingTemplate({
    template_owner: templateOwner,
    template_repo: templateRepo,
    owner: GITHUB_OWNER,
    name,
    description,
    private: isPrivate,
    include_all_branches: false,
  })

  return response.data
}

export interface CreateBranchOptions {
  owner: string
  repo: string
  branchName: string
  baseBranch?: string
}

export async function createBranch({
  owner,
  repo,
  branchName,
  baseBranch = 'main',
}: CreateBranchOptions) {
  // Get the SHA of the base branch
  const { data: ref } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${baseBranch}`,
  })

  // Create new branch
  const { data: newRef } = await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: ref.object.sha,
  })

  return newRef
}

export async function getRepoBranches(owner: string, repo: string) {
  const { data } = await octokit.repos.listBranches({
    owner,
    repo,
    per_page: 100,
  })
  return data
}

export async function getPullRequest(owner: string, repo: string, pullNumber: number) {
  const { data } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
  })
  return data
}

export async function getRepoInfo(owner: string, repo: string) {
  const { data } = await octokit.repos.get({
    owner,
    repo,
  })
  return data
}

export interface CreateWebhookOptions {
  owner: string
  repo: string
  webhookUrl: string
  secret: string
}

export async function createWebhook({
  owner,
  repo,
  webhookUrl,
  secret,
}: CreateWebhookOptions) {
  const { data } = await octokit.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webhookUrl,
      content_type: 'json',
      secret,
    },
    events: ['pull_request'],
    active: true,
  })
  return data
}
