# Wingmnn - Your Partner-in-crime

## Devlog 1

this devlog is coming very late in the development. still, it's better late than never, right!!

### Purpose of maintaining devlogs
purpose of these logs is to markdown any struggles i've had, any good solutions that i've found or any good insights that i've gotten while working on this project. there will be some updates here and there about the projects progress as well but it might not be as prevalent as the other things.

### Purpose of the project
this is a good place to write about the purpose of this project:
to make cool sh\*t, to learn from it and to be able give people an alternate, fun way to tackle their daily digital tasks.
it shouldn't be a toil to work to go through your emails, it shouldn't be hard to maitain your journal and notes, it shouldn't be stressful to manage your finances, it shouldn't be overwhelming to track your progress through your work and it shouldn't be a miserable experience to work on internet. but sadly, it has become quite unbearable to work on the internet at times (at least for me and some of the people i work with). it does not fill me with joy when i go to my mail box, instead i get stressed seeing so many unread mails (1722 unreads in my work mail, by the way and more than twice of that in my personal mail). i don't feel particularly happy seeing a dashboard full of open issues configured with unnecessarily complex workflows. i don't like it when i have to go through multiple apps to check on my finances.

### Initial Setup
initial setup was a simple one. i had two different directories - ui and backend. ui was (and is) in react + typescript. backend was done in golang then.
because of the language differences, i had not configured workspaces and it was just working.

but eventually, golang development was too slow for my liking (as i was learning the language while developing the stuff - everything from scratch). so i pulled the plug on golang backend and decided to move to typescript + hono for backend.

once i moved to typescript, it was obvious to convert the project into workspaces and that's what i did. converted it into bun workspaces and had backend and web packages initially.

i had some basic utility written for web package. as i started developing backend app, i needed those utilities in my backend package. so i decided to tear utility out of web package and created a new package for utilities only. now i can use it in both web and backend package.

then, one day i had an issue. i wanted to share the types from drizzle schema into my web package (drizzle schema was in backend package). instead of exposing all of the backend code to web package, i decided to move all the db related stuff into a new package and only expose those parts to both web and backend package. so that's what i did next.

but this caused another issue. i was getting path intellisense from db package into backend package, but that was not happening in web package. this was really weird issue and i could not find any fix for whole day. then i decided to reset my web package. i started installing dependencies one by one in web package in hopes of finding issue and i did. somehow, `@radix-ui/react-popover` and `@radix-ui/react-dialog` were causing issue. when i install either of these two, i will not get path intellisense from db package. i tried to find the issue but could not get any answer. so, as a last resort, i decided to move components out of the web package.

and so i started moving components into it's own package. once i got through it (and updated all the relevant imports in web package), i started the web server and voila! it worked - but not quite. i was getting styling issues.

see, i have setup tailwindcss in my web package. i am using tailwind classes in my components package and i have added tailwindcss as peer dependency in components package's package.json. i expected tailwindcss plugin in web package to pick up those classes and parse them alongside web package's classes. however, it ignored all the classes from components package and only parsed classes from web package. again, i scoured the internet and found a solution. tailwindcss provides a `@source` directive that lets you define source file paths that you want to parse together with current package's classes. this solved my issue. now i my project is properly loading!!
