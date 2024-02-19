// Name: Show only active App (Heidi)
// Description: Hide all Apps except the one that is currently active
// Snippet: ..heidi
// Video: https://media.schmedu.com/videos/heidi.mp4
// Author: Eduard Uffelmann
// Twitter: @schmedu_
// Linkedin: https://www.linkedin.com/in/euffelmann/
// Website: https://schmedu.com

import "@johnlindquist/kit";

await applescript(`
set myList to {"${(await getActiveAppInfo()).localizedName}"}
tell application "System Events"
    set visibleApps to name of every application process whose visible is true
    repeat with appl in visibleApps
        if myList does not contain appl then
            set visible of process appl to false
        else
            set the frontmost of process appl to true
        end if
    end repeat
    repeat with appl in myList
        set the frontmost of process appl to true
    end repeat
end tell
`);
