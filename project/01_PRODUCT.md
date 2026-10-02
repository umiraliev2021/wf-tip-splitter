# Product

Tip Splitter is a small, mobile-friendly static web app. The user enters a bill amount, picks a tip percentage (quick buttons 10/15/20% or a custom value) and the number of people, and immediately sees the tip, the total and the amount each person pays. Invalid input shows a clear message instead of numbers. The calculation logic lives in a plain JavaScript module that can be unit-tested with `node --test`, and the site deploys to GitHub Pages with no backend and no build step.

## Goals

- Let a user split a bill and tip among several people quickly on a phone
- Show tip, total and per-person amount right away as inputs change
- Show clear validation messages for bad input instead of nonsense numbers
- Make sure the per-person amounts always cover the full bill
- Ship as a static site with logic that can be unit-tested

## Non-goals

- Backend, user accounts or saved history
- Uneven or itemised splits (each person pays a different amount)
- Tax calculation or currency conversion
- Build tooling, bundlers or frameworks that need a build step
- Native mobile apps
