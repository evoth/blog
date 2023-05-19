---
{{ $slug := index (split .Name "_") 1 -}}
title: "{{ replace $slug "-" " " | title }}"
slug: "{{ $slug }}"
date: {{ .Date }}
draft: true
---
