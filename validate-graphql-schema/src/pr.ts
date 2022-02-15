import * as core from '@actions/core'
import * as github from '@actions/github'
import { HttpClient } from '@actions/http-client'
import { RequestHeaders } from '@octokit/types'

interface ListCommitPullsParams {
  repoToken: string
  owner: string
  repo: string
  commitSha: string
}

const listCommitPulls = async (
  params: ListCommitPullsParams,
): Promise<any | null> => {
  const { repoToken, owner, repo, commitSha } = params

  const http = new HttpClient('http-client-compare-env-vars')

  const additionalHeaders: RequestHeaders = {
    accept: 'application/vnd.github.groot-preview+json',
    authorization: `token ${repoToken}`,
  }

  const body = await http.getJson<any>(
    `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}/pulls`,
    additionalHeaders,
  )

  return body.result
}

const getIssueNumberFromCommitPullsList = (
  commitPullsList: any,
): number | null => (commitPullsList.length ? commitPullsList[0].number : null)

const isMessagePresent = (
  message: AddPrCommentInputs['message'],
  comments: any,
  login?: string,
): boolean => {
  const cleanRe = new RegExp('\\R|\\s', 'g')
  const messageClean = message.replace(cleanRe, '')

  return comments.some(({ user, body }: any) => {
    // If a username is provided we can save on a bit of processing
    if (login && user.login !== login) {
      return false
    }

    return body.replace(cleanRe, '') === messageClean
  })
}

interface AddPrCommentInputs {
  allowRepeats: boolean
  message: string
  proxyUrl?: string
  repoToken?: string
  repoTokenUserLogin?: string
}

export const comment = async (
  message: string,
  repoToken: string,
): Promise<void> => {
  try {
    if (!repoToken) {
      throw new Error(
        'no github token provided, set one with the repo-token input or GITHUB_TOKEN env variable',
      )
    }

    const {
      payload: { pull_request: pullRequest, issue, repository },
      sha: commitSha,
    } = github.context

    if (!repository) {
      core.info('unable to determine repository from request type')
      core.setOutput('comment-created', 'false')
      return
    }

    const { full_name: repoFullName } = repository
    const [owner, repo] = repoFullName!.split('/')

    let issueNumber

    if (issue && issue.number) {
      issueNumber = issue.number
    } else if (pullRequest && pullRequest.number) {
      issueNumber = pullRequest.number
    } else {
      // If this is not a pull request, attempt to find a PR matching the sha
      const commitPullsList = await listCommitPulls({
        repoToken,
        owner,
        repo,
        commitSha,
      })
      issueNumber =
        commitPullsList && getIssueNumberFromCommitPullsList(commitPullsList)
    }

    if (!issueNumber) {
      core.info(
        'this action only works on issues and pull_request events or other commits associated with a pull',
      )
      core.setOutput('comment-created', 'false')
      return
    }

    const octokit = github.getOctokit(repoToken)

    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: issueNumber,
    })

    if (isMessagePresent(message, comments)) {
      core.info('the issue already contains an identical message')
    } else {
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body: message,
      })
    }

    core.setOutput('comment-created', 'true')
  } catch (error) {
    core.setFailed(error.message)
  }
}
