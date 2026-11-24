---
title: "Prompt engineering as a discipline"
description: "I took a prompt engineering bootcamp in 2025 because work had started asking for AI everywhere. The course taught the easy half. The half that shipped was repetition."
pubDate: 2026-11-24
lede: "A prompt is not a trick. It is a spec that argues back."
heroImage: "/blog/prompt-engineering-as-a-discipline/prompt-engineering-as-a-discipline.jpg"
---
<audio controls preload="metadata" src="/blog/prompt-engineering-as-a-discipline/prompt-engineering-as-a-discipline-audio.mp3" class="w-full my-4"></audio>

In 2025 the requests at work changed from "can we build this" to "can we use AI for this". The assumption that I already knew how had moved from the leadership decks down into individual tickets. I did not know how, so I learned what a model actually does, then took a prompt engineering bootcamp, because the prompt looked like the developer's half of it. A year on, most of the course has aged. What survived was the repetition. Nobody sells that part.

## What the course got right

It gave me a structure: state the task, state the rules, hand the model the variables it needs, then tell it what a good answer looks like. It made me use few-shot examples, which are still in my prompts today because they work. The most useful thing it taught me is narrower than either: decide what the model gets to see. Sending counts and dates instead of identifiers is a design decision rather than a prompt trick. It has changed accuracy more than any wording I have tried.

## What it did not cover

Agents. The course assumed one request in, one answer out. The work did not. Getting a model to call a tool, read what comes back, decide again and stop is a different shape. The course had nothing on it.

I worked that part out myself in about a day: the loop, the tool definitions, keeping the conversation for the next turn, a limit that ends cleanly instead of hanging. The API tells you how it wants its tools described. The loop is a while statement with a boundary and a failure path. That was the easy half.

The system prompt was the hard half. It is the thing I have not stopped working on since. The models are good enough now that the plumbing around them is a weekend. The system prompt is where the product actually lives.

## Start from the output

The user never sees your prompt, your tools or your loop. They see the output. So the first decision is not the prompt; it is what the output has to be. The fields. The status values. The length limit. The cases where it should refuse and ask a person instead. Write that down before you write a word of instruction.

Then look at the inputs. You usually cannot change them. The page is the page, the rows are the rows, the customer sends what the customer sends. The job is to engineer the model to map the inputs you were given onto the output you decided. That is a specification. If you have built software before, you already know how to write one.

Once the output is fixed, the prompt stops being prose. Every sentence in it either serves the contract or is decoration. Most prompt advice you will read online is decoration advice.

```python
from dataclasses import dataclass
from enum import Enum

class Status(str, Enum):
    OK = "ok"
    PROBLEM = "problem"
    HELP = "help"

@dataclass
class Verdict:
    status: Status
    findings: list[str]  # capped at four, one sentence each
    confidence: float
```

The prompt's job is to make the model return exactly that. The first version will not. That is what the next three hundred runs are for.

## The only test that matters

Nothing here is proven by reading the answer once and liking it. That is the habit I had to break.

The test is to run the same input hundreds of times, a thousand if you can afford it, then check that the output lands in the same place every time, or close enough that the difference does not change what anyone does with it. Then you change the prompt and run it again, because the first version never holds. When a model gets upgraded underneath you, or you move provider, the output has to stay put as well. A prompt that only worked on one model on one weekend is not shipped. It is a demo.

Put it in software terms and it stops sounding like a new discipline at all. You have a component with a known input, a contract on the output and a regression suite you run before every change. The only difference is that this component is not deterministic by default, so the work is making it behave as though it were. That is not a trick. It is the most ordinary thing an engineer does, applied to something that will not sit still.

There is a second reason to run it that many times. It is the one that convinced me. Hand a colleague the prompt, the inputs and the way you measure the answer. They can decide for themselves whether it holds. Hand them one good answer and they have to believe you. Work that can be checked is most of what separates engineering from everything else.

## "It's just talking to a chatbot"

That objection is fair. The honest answer is that it is only true when a prompt is used the way a chatbot is: one input, one answer, judged by eye, thrown away. Change a word and the answer changes. Change the model and it changes again. That variability is why people outside the work think the whole field is nonsense. They have a point about the way a lot of it is practised.

It is also just a variable. A variable you do not control is a defect. Fix the input, fix the contract on the output, then run it until the result stops moving. You are no longer chatting with anything. You are doing what you have done on every other component in your career, on one that happens to resist it.

## What did not survive

The course spent a module on image generation. I have never needed it. I have not opened it since. The tool names and model tips I wrote in the notes were stale within a year. What survived is dull: state the task, give examples, narrow the input, fix the output, run it until the answer stops moving. Every part that was a technique aged. The parts that were method did not. If you are learning this now, spend your attention on the method and expect the techniques to expire.

## Why this matters in 2026

I am not going to tell you it is a new profession. It is not. But most teams are being told to use AI more. The gap between the team that ships and the team that demos has nothing to do with model access. It is whether anyone on that team treats a prompt as an artefact with a version, a contract, a test, a failure mode and a cost. That work has no job title yet, which is why it goes unrecognised. It is exactly the work a software developer is already trained to do.

## What I would do on Monday

If you are the developer quietly hoping this blows over: learn how the model produces text first, take the course if a course is how you learn, then write one prompt and run it two hundred times before you show it to anyone. Start from the output you want, accept the inputs you were given, then keep adjusting the prompt until the same answer comes back twice. That is the skill. The tools will keep changing; the discipline is what you keep.

*Hero image: punch cards on a Jacquard loom at the National Museum of Scotland. Photograph by Stephencdickson, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), via Wikimedia Commons.*
