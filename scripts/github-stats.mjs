// Snapshots public GitHub stats into src/pages/About/github-stats.json.
// Usage: node scripts/github-stats.mjs [--lines]
//   --lines  also sums lines added across repos (slow; set GITHUB_TOKEN to avoid the 60 req/hr limit)
import { readFile, writeFile } from 'node:fs/promises';

const USER = 'arkmadj';
const OUT = new URL('../src/pages/About/github-stats.json', import.meta.url);
const WITH_LINES = process.argv.includes('--lines');

const headers = {
  Accept: 'application/vnd.github+json',
  ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
};

const get = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (res.status === 403 || res.status === 429) {
    throw new Error(`Rate limited on ${path}; set GITHUB_TOKEN and retry`);
  }
  return res;
};

const json = async (path) => (await get(path)).json();
const count = async (query) => (await json(`/search/${query}&per_page=1`)).total_count;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// GitHub computes contributor stats lazily and answers 202 until they're ready.
const contributorStats = async (repo) => {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await get(`/repos/${USER}/${repo}/stats/contributors`);
    if (res.status === 200) return res.json();
    if (res.status !== 202) return [];
    await sleep(3000);
  }
  console.warn(`  gave up waiting on ${repo}`);
  return [];
};

const sumLines = async (repos) => {
  let additions = 0;
  for (const repo of repos) {
    const stats = await contributorStats(repo.name);
    const mine = stats.find((entry) => entry.author?.login.toLowerCase() === USER);
    additions += mine?.weeks.reduce((sum, week) => sum + week.a, 0) ?? 0;
    console.log(`  ${repo.name}: +${additions} so far`);
  }
  return additions;
};

const previous = JSON.parse(await readFile(OUT, 'utf8').catch(() => '{}'));
const profile = await json(`/users/${USER}`);
const repos = (await json(`/users/${USER}/repos?type=owner&per_page=100`)).filter(
  (repo) => !repo.fork
);

// Share of original repos by primary language, top 6 plus "Other".
const byLanguage = {};
for (const { language } of repos) {
  if (language) byLanguage[language] = (byLanguage[language] ?? 0) + 1;
}
const ranked = Object.entries(byLanguage).sort(([, a], [, b]) => b - a);
const languages = ranked.slice(0, 6).map(([name, repoCount]) => ({ name, repos: repoCount }));
const other = ranked.slice(6).reduce((sum, [, repoCount]) => sum + repoCount, 0);
if (other) languages.push({ name: 'Other', repos: other });

const result = {
  joined: profile.created_at.slice(0, 10),
  repos: repos.length,
  commits: await count(`commits?q=author:${USER}`),
  mergedPRs: await count(`issues?q=type:pr+author:${USER}+is:merged`),
  languages,
  linesWritten: WITH_LINES ? await sumLines(repos) : (previous.linesWritten ?? null),
  fetchedAt: new Date().toISOString().slice(0, 10),
};

await writeFile(OUT, `${JSON.stringify(result, null, 2)}\n`);
console.log(result);
