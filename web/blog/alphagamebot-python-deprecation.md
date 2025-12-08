---
title: "AlphaGameBot 2.x and 3.x Deprecation Notice"
date: "2025-12-08"
category: "announcement"
---
Hello!

This is definitely not something I have been looking forward to.  I have postponed deprecating AlphaGameBot *2.x* and *3.x* for a very long time now.  It's primarily for sentimental reasons: I have been working on that codebase for three years now, and it always feels bad to say goodbyes.

However, the longer I wait, the longer I am maintaining two fundamentally different projects at the same time, and it's a lose-lose situation where I am not able to put my focus on one of them.

I started the AlphaGameBot project in the beginning of my freshman year of high school, where I wanted to make a Discord bot for my friend group.  From there, I met many great people and projects, especially [CombineBot](https://combinebot.github.io), which friendly competition helped accelerate the project to the scope it is today.

Now, three years later, as a junior, I can say confidently that this is the single most influential project I've ever worked on—both personally and technically. It's the first project I started from scratch, saw it through to production, and maintained happily for these couple years.

That's why I'm sending it off like this: a final thank you and goodbye.

---

For the past three years I have been working on the [AlphaGameBot](https://github.com/AlphaGameBot) project, and it has been my favorite project overall.  In the time that I have been working on it, I have learned so much, not just about Python, but Pycord, MySQL, Docker, Jenkins, and so many other wonderful technologies I've used while working on this project.

However, over the last year, I have become increasingly aware of the fact that this codebase is not very good, at all.  It's clear from many design decisions that I was treating this as a personal project—Which it is—but the codebase was becoming increasingly large and disorganized, eventually making implementing more features very difficult.

My database strategy was especially problematic.  I was executing commands directly against the production database while testing and with next to no separation between development and production.  No schemas, no migrations, and lots of handwritten SQL, making maintenance fragile and debugging painful.  Combined with a lack of monitoring, type checking, and overall bad practices, bugs became far too common.

And finally, the straw that broke the camel's back, was that I was finally reaching the limits of [Pycord](https://pycord.dev).  It's a wonderful project and library, and I love and still highly recommend it, but like any project, AlphaGameBot simply outgrew Pycord.

It is for this reason that in October of 2025, I began the long process of migrating AlphaGameBot to use [Discord.js](https://discord.js.org), and that is going very well.  This also fulfills my dream of website, WebUI, and bot in one codebase.  So, along with this, the repository for the WebUI will be deprecated and archived.  I am now using Prisma for the database, making the database much more maintainable, and am in the process of moving to PostgreSQL, because it'd be better for the new bot, and works perfectly for Prisma.

I will also stop supporting the `--no-database` flag. It was useful while testing, but the reason it was added in the first place was because the original AlphaGameBot was never meant to be what it eventually became.  This is yet another symptom of the greater problem, which is that, while I kept lots of features in to make it easy to self-host, at the end of the day, I am going to be focusing more on the official instance, which allows for greater and deeper integration of things like the website and bot.

Actually, funny thing— AlphaGameBot 1.0 never really happened. It was a dumb project I did at one point, abandoned after a day, and when I restarted to make it a real bot, it became AlphaGameBot 2.0, and with the addition of the database, AlphaGameBot 3.0.  This marks AlphaGameBot 4, and is going to hopefully be the final major version.  TypeScript has been wonderful to work with, and the stupid bugs are almost completely eliminated now.

So with that,
> We had so much fun, so thank you and good night!

---

This is by no stretch of the imagination the end of AlphaGameBot; it's a new beginning.  A fresh codebase, washed free of its original sin, and going to be a much better project, tool, or whatever you see it as.

To everyone who ran AlphaGameBot, reported bugs, or broke it in creative ways—thank you.  It means the world to me.

Chao!
- Damien Boisvert (AlphaGameDeveloper)