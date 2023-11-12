---
{{ $slug := index (split .Name "_") 1 -}}
date: {{ .Date }}
title: {{ replace $slug "-" " " | title }}
summary:
slug: {{ $slug }}
resources:
- name: thumb
  src:
  params:
    alt:
- name: hero
  src:
  params:
    alt:
projects:
series:
tags:
draft: true
publishDate:
---
