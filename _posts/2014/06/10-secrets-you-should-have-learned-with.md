---
template: post
title: 10 Secrets You Should Have Learned with Your Software Engineering Degree –
  But Probably Didn’t
date: "2014-06-11"
author: Unknown
tags:
- Devlopers
- Software Engineering
- Software
modified_time: '2014-06-11T20:59:34.772+07:00'
thumbnail: https://4.bp.blogspot.com/--7etYcfMsrk/U5hgSH12GUI/AAAAAAAAGso/9WpH-R4jsFg/s1600/shutterstock_150587633_techschool.jpg
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4975095902762048407
blogger_orig_url: https://blog.duyet.net/2014/06/10-secrets-you-should-have-learned-with.html
slug: /2014/06/10-secrets-you-should-have-learned-with.html
description: "It’s an all too common story: You go to school for years and years and walk out with a freshly printed diploma, snag your first job, and yet get immediately blindsided by unwritten rules and other day-to-day complexities that no one bothered to warn you about. And programming is no exception."
---

It’s an all too common story: You go to school for years and years and walk out with a freshly printed diploma, snag your first job, and yet get immediately blindsided by unwritten rules and other day-to-day complexities that no one bothered to warn you about. And programming is no exception.

Few students are 100% prepared for their first real job. And a computer science degree is lot more than a vocational degree solely designed to prepare students for a job writing banking apps. But I’m still continually surprised to see how many recent graduates—and even some experienced programmers—who still edit their code in Notepad or Pico and don’t know how to use version control.

If you don’t want to be "that person" – or don’t want to be that person anymore — take the time to learn these 10 basic skills and you won’t need hand-holding to get the real work done:

![](https://4.bp.blogspot.com/--7etYcfMsrk/U5hgSH12GUI/AAAAAAAAGso/9WpH-R4jsFg/s1600/shutterstock_150587633_techschool.jpg)

## 1. Version control systems ##

It’s perhaps the biggest omission in computer science curricula. Institutions of higher education teach how to create source code for programs, but usually ignore everything about the management of that code. Every programmer should know how to create repositories, edit and commit code, and branch and merge effectively as part of a project workflow using Git or Subversion. Knowing about version control systems also means that you’ll know better than to work for any organization that doesn’t use one.

## 2. How to write ##

Working as a programmer is more than just writing in a programming language. You also have to write release notes for your projects. You write commit messages for version control. You write tickets for bugs in the system. All of these and many more require clear, effective English communication – a skill that computer science programs seldom emphasize.

## 3. Regular expressions ##

Regexes are a language all their own, and every modern programmer needs to be adept in their use. Every programming language supports regexes or has standard libraries to work with them. If part of your code assignment is to validate that a part number is five letters, a dash and a digit, you should be immediately able to express that as /^[A-Z]{5}-\d$/.

## 4. Using libraries ##

It’s 2014, and nobody needs to use a regular expression to extract the hostname from a URL. Every modern programming language includes a standard library of common functionality, or has standard libraries easily available.

Programmers need to understand that code that has already been written, tested, and debugged is going to be better quality than new code that she has to create. Even more important, code that doesn’t have to be written can be implemented much faster.

## 5. SQL ##

As someone said to me at a meetup recently, "All the SQL I know I learned on the job. Why are databases an elective? What doesn’t use a database?"

The era of storing data in flat files is over. Everything goes into and out of a database, and SQL is the language that’s used to retrieve it. SQL is also a declarative language, not a procedural language, and so requires learning a new way of thinking about problem solving. But every programmer should understand the basics of database normalization and be able to do SELECTs (including basic INNER and OUTER JOINs), INSERTs, UPDATEs and DELETEs.

## 6. Tool usage: IDEs, editors, CLI tools ##

A carpenter would never complete an apprenticeship knowing how to use a only hacksaw, so it’s astonishing that schools can turn out CS graduates who know only Notepad or pico. It’s the job of programming tools to help manipulate the source code and all other data in the computer to make the programmer’s life easier. The Unix command line, shell scripting, find, grep, and sed should be part of every programmer’s knowledge set.

## 7. Debugging ##

Every programmer should be able to debug with an interactive debugger or by sprinkling print statements liberally throughout the code. The ability to track down a problem through stepwise refinement is too important to be left for programmers to learn by the seat of their pants.

## 8. Defensive programming ##

Even rockstar programmers are fallible, much of the world is out of our control, and things will go wrong. Defensive programming is about understanding that simple truth. If things didn’t go wrong, we wouldn’t have to check file opens for success, or assert that customer IDs are valid integers, or to test our code to make sure that it works properly.

Programmers need to grasp that compiler warnings are helpful tools that make life easier, not nuisances to be avoided. Every programmer should know why each PHP program should start with
error_reporting(E_ALL), or each Perl program with use strict; use warnings;.

## 9. Teamwork ##

Very few programming jobs allow you to work entirely on your own–and those that do are often intellectually crippling and leave you a worse programmer than when you started. Your code must interact with code written by others, or often be intermingled with code from others. No matter how talented, a programmer who can’t collaborate on projects with others has negative productivity, and quickly becomes a liability to the organization.

## 10. Working on existing code ##

In school, every class assignment is a new, greenfield project. That’s not how it works in the real world. The first thing that happens to new hires is they get assigned to fix ticket #8347 in the bug tracking system. After that, they have to add a small new complementary feature to an existing system with an established codebase. Designing new code comes months later, if they’re lucky.
