function getPathTitle() {
    // Get the pathname part of the URL and remove any leading/trailing slashes
    const path = window.location.pathname.replace(/^\/|\/$/g, '');

    // If the path is empty, assume "Home"
    if (path === '') return 'Home';

    // Split the path into parts, capitalize each part, and join with a space
    return path
        .split('/')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

document.addEventListener("DOMContentLoaded", async function() {
    try {
        // Get contents el
        const el_content = document.getElementById("markdown");

        // Fetch markdown file
        let res = await fetch("content.md");
        if (!res.ok) {
            if (res.status == 404) {
                el_content.innerText = "404: Not Found — Content file is missing from the subdirectory.";
            } else {
                el_content.innerText = res.status + ": " + res.statusText;
                throw new Error("Failed to load markdown file!\n\n" + res.status + ": " + res.statusText);
            }
            return;
        }
        let md_text = await res.text();

        // Fetch table of contents if enabled
        if (el_content.getAttribute("data-no-table-of-contents") == null) {
            res = await fetch("/content-table.md");
            if (res.ok) {
                md_text += "\n";
                md_text += await res.text();
            }
    
        }
        
        // Convert to HTML using Showdown
        const converter = new showdown.Converter({
            metadata: true,
            customizedHeaderId: true,
            ghCompatibleHeaderId: true,
            emoji: true,
            openLinksInNewWindow: true,
            parseImgDimensions: true,
            simpleLineBreaks: true,
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            smartIndentationFix: true,
            splitAdjacentBlockquotes: true,
            strikethrough: true,
            tables: true,
            tablesHeaderId: true,
            tasklists: true,
            underline: true
        });
        const content = converter.makeHtml(md_text);

        // Insert into HTML
        el_content.innerHTML = content;

        // Add favicon if it doesn't exist
        let el_favicon = document.getElementById("favicon");
        if (el_favicon == null) {
            el_favicon = document.createElement("link");
            el_favicon.setAttribute("rel", "icon");
            el_favicon.setAttribute("type", "image/png");
            el_favicon.setAttribute("href", "/favicon.png");
            document.head.appendChild(el_favicon);
        }

        // Add styles if it doesn't exist
        let el_styles = document.getElementById("styles");
        if (el_styles == null) {
            el_styles = document.createElement("link");
            el_styles.setAttribute("rel", "stylesheet");
            el_styles.setAttribute("href", "/style.css");
            document.head.appendChild(el_styles);
        }

        // Add title if it doesn't exist
        let el_title = document.getElementsByTagName("title")[0];
        if (el_title == null) {
            el_title = document.createElement("title");
            el_title.innerText = getPathTitle() + " — FireController#1847";
            document.head.appendChild(el_title);
        }

        // Check for any URL fragments after loading content
        const fragment = window.location.hash;
        if (fragment) {
            const target = document.querySelector(fragment);
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
                target.classList.add("highlighted-element");
            }
        }
    } catch (e) {
        console.error("Error loading markdown file!", e);
    }
});