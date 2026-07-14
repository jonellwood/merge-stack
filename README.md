# merge-stack

A tiny git-themed CLI game where `merge`, `rebase`, and `cherry-pick` battle it out.

## Play

```bash
npm start -- merge
```

You can also run `npm start` and enter your move when prompted.

## Rules

- `merge` beats `cherry-pick`
- `cherry-pick` beats `rebase`
- `rebase` beats `merge`