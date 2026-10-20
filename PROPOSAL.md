# Proposal: Lesson Prep Planner

## Problem / Purpose
(Who has this problem, and why does it matter?)
Preschool and kindergarten teachers face this problem. It matters because when teachers have these resources ready, they can spend more time focusing on children's development instead of brainstorming lessons and worrying about the time and materials needed to prepare them.
## Target User
(Who will actually use this tool?)
Preschool and kindergarten teachers will use this tool. More specifically, I will be the first user, using it to make my own workday easier.
## Core Idea (one paragraph)
(Plain description of what the tool does.)
This tool stores lesson data (materials needed, prep time required, and age/duration info) and calculates how long each lesson takes to prepare and when each material needs to be ready, so I know exactly what to prepare and when to hand it out to the children.
## Stored Data
(What fields does each activity have? e.g., date, age range, duration, prep time, materials, prep status.)
Each activity stores its materials, prep time, age range, and lesson duration.
## Key Actions
(What can the user do? e.g., add activity, mark materials ready, filter by date, reset.)
Users can save an activity, mark materials as ready, filter by date, and reset the plan.
## Calculated Outputs
(What does the tool compute from stored data? e.g., total prep minutes per day, upcoming activities needing materials.)
The tool calculates the total prep time per day and lists upcoming activities that still need materials.
## Interactions (at least 3 types)
(Form, filter/dropdown, buttons, checkboxes, etc.)
A filter/dropdown, buttons, and checkboxes.
## Page States
(What should Empty, Invalid Input, In Use, and After Reset look like?)
* Empty: No activities are scheduled yet. The page invites the user to choose an activity and date. The scheduled list is empty and preparation totals are zero.
* Invalid Input: If the user tries to schedule without choosing an activity or date, an inline message explains what is missing. The plan stays unchanged and the rest of the page remains usable.
* In Use: Scheduled activities appear by date. The page shows each activity’s duration, age range, materials, readiness status, and the total preparation time needed for each day.
* After Reset: The scheduled plan and material statuses are cleared. A brief confirmation appears, the page returns to the empty state, and the fixed activity list is still available.
## Out of Scope / Not Doing
(What you are explicitly NOT building, to keep scope realistic for the deadline.)
Users cannot create or edit the fixed activity list. The tool will not generate a complete curriculum, use user accounts or cloud storage, or call outside APIs.