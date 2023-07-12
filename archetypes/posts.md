---
{{ $slug := index (split .Name "_") 1 -}}
date: {{ .Date }}
title: {{ replace $slug "-" " " | title }}
slug: {{ $slug }}
resources:
- name: thumb
  src:
  params:
    alt:
    loopSeconds:
- name: hero
  src:
  params:
    alt:
    loopSeconds:
projects:
series:
tags:
draft: true
publishDate:
---
