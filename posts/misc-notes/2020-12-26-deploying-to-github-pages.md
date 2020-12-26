---
layout: post
title: "Deploying user site to github pages"
tags: [Misc. Notes]
toc: false
icon: /img/header/data_viz.svg
notfull: 0
keywords: 'github pages user site hugo eleventy 11ty'
---

Unlike Jekyll, Hugo / 11ty / other static site generators do not work with Github Pages out of the box.

The biggest worry for me was that I did not want the commit history of my site to be polluted with large changes to the generated files. Ideally, we want to separate the commit histories of the source files and the generated files.

One simple way of doing this is simply by creating 2 github repositories. One for the generated site and one for the source files used to generate the site. By adding the generated site repository as a submodule of the source file repository, both source and generated repositories will be committed together. This is the approach given in the Hugo Docs.

However, just for fun, I wondered if one could still achieve the original requirement of source and generated file separation using only one github repo, which would make things much cleaner. This is complicated by the fact that for a Github User Page, the page can only be served out of the master branch.

We outline a simple solution below using different branches.

1) Create a new repository and a new branch called source to store our source files. Note that we also need to ignore the `public/` folder, which is where all our generated files from Hugo will be stored.

```bash
# Create the directory structure starting from an empty git repo
git clone https://github.com/choonkiatlee/choonkiatlee.github.io.git

# Create a new branch called source that will store our source files
cd choonkiatlee.github.io
git checkout --orphan source

# Setup the .gitignore file
echo public/ >> .gitignore
```

2) Create our new site (example given for the case if initialising a new site with hugo)
   
```bash
# Initialise our hugo site
hugo new site . --force

# (Optional -- Add some content)
hugo new posts/my-first-post.md
```

3) Initialise our master branch within the public directory. All our generated files will live here, and can be pushed directly to our main branch on our Github Pages repository.

```bash
# Setup the generated files git repo
git clone https://github.com/choonkiatlee/choonkiatlee.github.io.git public

# Generate the site for the first time
hugo -D
```

4) Push all changes to the repository and watch the magic happen!

```bash
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

This results in a local directory setup that looks like this:
```
.
├── archetypes (Source Files -- in the Source branch)
├── build.sh 
├── ...
└── public     (Generated Files -- in the Master branch)
    └── css
    └── tags
    └── ...
```

5) Lastly, you can build and push your entire site to github with the following script. The commands can also be run as-is on windows using the command prompt if you have git configured on your path. 

```bash
#!/bin/bash

# Build your site. Replace hugo with npx @11ty/eleventy for 11ty
hugo

# Commit and push
cd  public 
git add .
git commit -m "Update generated website"

# Force push because we don't care about the state of our master branch, we just want to push our currently generated files
git push -f
cd ..
```