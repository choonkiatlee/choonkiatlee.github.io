---
title: "First_post"
date: 2020-04-20T17:04:49+08:00
draft: true
---


# TIL: Setting up Hugo to work with Github Pages

Unlike Jekyll, Hugo does not work with Github Pages out of the box. 

One very simple way of doing this 

The biggest worry for me was that I did not want the commit history of my site to be polluted with large changes to the generated files. Ideally, we want to separate the commit histories of the source files and the generated files. 

One simple way of doing this is simply by creating 2 github repositories. One for the generated site and one for the source files used to generate the site. By adding the generated site repository as a submodule of the source file repository, both source and generated repositories will be committed together. This is the approach given in the [Hugo Docs](https://gohugo.io/hosting-and-deployment/hosting-on-github/#step-by-step-instructions).

However, just for fun, I wondered if one could still achieve the original requirement of source and generated file separation using only one github repo, which would make things much cleaner. This is complicated by the fact that for a Github User Page, the page can only be served out of the master branch. 

We outline a simple solution below using different __branches__. 

```bash
# Create the directory structure starting from an empty git repo
git clone https://github.com/choonkiatlee/choonkiatlee.github.io.git

# Create a new branch called source that will store our source files
cd choonkiatlee.github.io
git checkout --orphan source

# Setup the .gitignore file
echo public/ >> .gitignore

# Initialise our hugo site
hugo new site . --force

# (Optional -- Add themes)
git submodule add https://github.com/budparr/gohugo-theme-ananke.git themes/ananke
echo 'theme = "ananke"' >> config.toml

# (Optional -- Add some content)
hugo new posts/my-first-post.md

# Setup the generated files git repo
git clone https://github.com/choonkiatlee/choonkiatlee.github.io.git public

# Generate the site for the first time
hugo -D

# Commit the source files
git add .
git commit -m "Initial commit of source files"
git push --set-upstream origin source

# Commit the main site
cd public
git add .
git commit -m "Initial commit of generated site"
git push 

```


Local directory setup: 
```
.
├── archetypes
├── content
│   └── posts
|   .
|   .
|   .
└── public
    └── css
    └── tags
    └── ...
```

