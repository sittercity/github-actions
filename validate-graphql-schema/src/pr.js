"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.comment = void 0;
var core = require("@actions/core");
var github = require("@actions/github");
var http_client_1 = require("@actions/http-client");
var listCommitPulls = function (params) { return __awaiter(void 0, void 0, void 0, function () {
    var repoToken, owner, repo, commitSha, http, additionalHeaders, body;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                repoToken = params.repoToken, owner = params.owner, repo = params.repo, commitSha = params.commitSha;
                http = new http_client_1.HttpClient('http-client-compare-env-vars');
                additionalHeaders = {
                    accept: 'application/vnd.github.groot-preview+json',
                    authorization: "token ".concat(repoToken)
                };
                return [4 /*yield*/, http.getJson("https://api.github.com/repos/".concat(owner, "/").concat(repo, "/commits/").concat(commitSha, "/pulls"), additionalHeaders)];
            case 1:
                body = _a.sent();
                return [2 /*return*/, body.result];
        }
    });
}); };
var getIssueNumberFromCommitPullsList = function (commitPullsList) { return (commitPullsList.length ? commitPullsList[0].number : null); };
var isMessagePresent = function (message, comments, login) {
    var cleanRe = new RegExp('\\R|\\s', 'g');
    var messageClean = message.replace(cleanRe, '');
    return comments.some(function (_a) {
        var user = _a.user, body = _a.body;
        // If a username is provided we can save on a bit of processing
        if (login && user.login !== login) {
            return false;
        }
        return body.replace(cleanRe, '') === messageClean;
    });
};
var comment = function (message, repoToken) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, pullRequest, issue, repository, commitSha, repoFullName, _c, owner, repo, issueNumber, commitPullsList, octokit, comments, error_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 9, , 10]);
                if (!repoToken) {
                    throw new Error('no github token provided, set one with the repo-token input or GITHUB_TOKEN env variable');
                }
                _a = github.context, _b = _a.payload, pullRequest = _b.pull_request, issue = _b.issue, repository = _b.repository, commitSha = _a.sha;
                if (!repository) {
                    core.info('unable to determine repository from request type');
                    core.setOutput('comment-created', 'false');
                    return [2 /*return*/];
                }
                repoFullName = repository.full_name;
                _c = repoFullName.split('/'), owner = _c[0], repo = _c[1];
                issueNumber = void 0;
                if (!(issue && issue.number)) return [3 /*break*/, 1];
                issueNumber = issue.number;
                return [3 /*break*/, 4];
            case 1:
                if (!(pullRequest && pullRequest.number)) return [3 /*break*/, 2];
                issueNumber = pullRequest.number;
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, listCommitPulls({
                    repoToken: repoToken,
                    owner: owner,
                    repo: repo,
                    commitSha: commitSha
                })];
            case 3:
                commitPullsList = _d.sent();
                issueNumber =
                    commitPullsList && getIssueNumberFromCommitPullsList(commitPullsList);
                _d.label = 4;
            case 4:
                if (!issueNumber) {
                    core.info('this action only works on issues and pull_request events or other commits associated with a pull');
                    core.setOutput('comment-created', 'false');
                    return [2 /*return*/];
                }
                octokit = github.getOctokit(repoToken);
                return [4 /*yield*/, octokit.rest.issues.listComments({
                        owner: owner,
                        repo: repo,
                        issue_number: issueNumber
                    })];
            case 5:
                comments = (_d.sent()).data;
                if (!isMessagePresent(message, comments)) return [3 /*break*/, 6];
                core.info('the issue already contains an identical message');
                return [3 /*break*/, 8];
            case 6: return [4 /*yield*/, octokit.rest.issues.createComment({
                    owner: owner,
                    repo: repo,
                    issue_number: issueNumber,
                    body: message
                })];
            case 7:
                _d.sent();
                _d.label = 8;
            case 8:
                core.setOutput('comment-created', 'true');
                return [3 /*break*/, 10];
            case 9:
                error_1 = _d.sent();
                core.setFailed(error_1.message);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
exports.comment = comment;
