# Agents Instructions

## Overview

The purpose of this code is to deliver an interface to manage 
 - Content Seucrity Policy
 - Permissions Policy
 - Standard OWASP Security HTTP headers

There is also a reporting dashboard.  This has a graph to show issues over a time period and also a screen to search for issues.

## Supporting Code
The parent folder is the C# application that delivers the API's used by the interface.  The code in the parent folder contains a features folder, each sub folder has code that delivers a specific feature.

## Running Test instance of interface
- `src/Jhoose.Security/src/index.js` - This used to run a test version of the interface
- `src/Jhoose.Security/src/index.html` - This is the HTML page to host the test interface
- `src/Jhoose.Security/src/TestData` - This folder contains test json.

## Development Technologies
 - Typescript
 - React19
 - UI Components Ant Design https://ant.design/
 - Styling is handled by vanilla CSS


 ## Development Approach
 