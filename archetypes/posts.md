---
{{ $slug := index (split .Name "_") 1 -}}
date: {{ .Date }}
title: {{ replace $slug "-" " " | title }}
slug: {{ $slug }}
projects:
series:
tags:
draft: true
publishDate:
---
