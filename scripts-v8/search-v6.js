const RELATED = [
    ['firelight','candle','flame'],
    ['smudge','incense'],
    ['lighter','igniter'],
    ['breaker','circuit'],
    ['extinguish','blow out','blows out'],
    ['paramic','parabolic'],
    ['guaranteed','forced']
]


function search() {
    let search_query = document.getElementById("search_bar").value.toLowerCase().trim();
    let results = "";
    let matched = new Set()

    if (search_query.length > 1 || (search_query.length > 0 && ['ko','zh-cn'].includes(lang))) {
        let query_parts = search_query.split(/\s+/);
        const relatedTerms = get_terms(query_parts, RELATED);

        // Search ghost cards
        const cards = document.getElementsByClassName("ghost_card");
        Array.from(cards).forEach((card) => {
            const behaviorText = card.getElementsByClassName("ghost_behavior")[0].innerText.toLowerCase();
            const nameText = card.getElementsByClassName("ghost_name")[0].innerText.toLowerCase();

            relatedTerms.forEach(terms => {
                if(!matched.has(card)){
                    if (all_match(behaviorText,terms)) {
                        results += parse_card(card, terms);
                        matched.add(card)
                    } 
                    else if (all_match(nameText,terms)) {
                        results += parse_card(card, terms, true);
                        matched.add(card)
                    }
                    else if (all_match(nameText+" "+behaviorText,terms)){
                        results += parse_card(card, get_partial_match(behaviorText,terms))
                        matched.add(card)
                    }
                }
            })
        });

        // Search wiki
        const entries = document.getElementsByClassName("wiki_details");
        Array.from(entries).forEach((entry) => {
            const entryText = entry.innerText.toLowerCase();
            const titleText = entry.previousElementSibling?.innerText.toLowerCase() ?? "";

            if(entry.querySelectorAll(".wiki_details").length === 0){
                relatedTerms.forEach(terms => {
                    if(!matched.has(entry)){
                        if (all_match(entryText,terms) || all_match(titleText,terms)) {
                            results += parse_wiki(entry, terms);
                            matched.add(entry)
                        } 
                    }
                })
            }
        });

        // Search current events
        const event = document.getElementById("event_details");
        const eventText = event?.innerText.toLowerCase() ?? "";
        relatedTerms.forEach(terms => {
            if(!matched.has(event)){
                if(all_match(eventText,terms)){
                    results += parse_event(event, terms);
                    matched.add(event)
                }
            }
        })
    }

    document.getElementById("search_results_block").innerHTML = results;
}

function get_partial_match(text, searchTerms) {
    const lowerText = text.toLowerCase();
    return searchTerms.filter(term => lowerText.includes(term.toLowerCase()));
}

function all_match(text,terms) {
    return terms.every(term => text.includes(term))
}

function get_terms(query_group, relatedGroups) {
    let new_groups = []
    for (const group of relatedGroups) {
        for(const qterm of query_group){
            if (group.some(term => term.toLowerCase() === qterm)) {
                group.forEach(t => {
                    let new_t = [...query_group]
                    new_t[new_t.indexOf(qterm)]=t
                    new_groups.push(new_t)
                })
            }
        }
    }
    return new_groups.length > 0 ? new_groups : [query_group];
}

function get_text(element) {
    let text = '';
    for (let node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
        }
    }
    return text.trim();
}

function shrink_text(html, searchTerms) {
    const lowerHTML = html.toLowerCase();
    const lowerTerms = searchTerms.map(term => term.toLowerCase());

    // Find the earliest and latest occurrence of any of the search terms
    const matches = [];
    for (const term of lowerTerms) {
        const regex = new RegExp(escapeRegExp(term), 'gi');
        let match;
        while ((match = regex.exec(lowerHTML)) !== null) {
            matches.push({ index: match.index, length: match[0].length, term });
        }
    }

    if (matches.length === 0) return null;

    // Sort matches by index
    matches.sort((a, b) => a.index - b.index);

    // Find the smallest span that includes at least one of each unique term
    let bestSpan = null;
    const termSet = new Set(lowerTerms);

    for (let start = 0; start < matches.length; start++) {
        const seen = new Set();
        for (let end = start; end < matches.length; end++) {
            seen.add(matches[end].term);
            if (seen.size === termSet.size) {
                const spanStart = matches[start].index;
                const spanEnd = matches[end].index + matches[end].length;
                if (!bestSpan || (spanEnd - spanStart < bestSpan.end - bestSpan.start)) {
                    bestSpan = { start: spanStart, end: spanEnd };
                }
                break;
            }
        }
    }

    if (!bestSpan) return null;

    // Expand outward to include full tags
    let htmlStart = bestSpan.start;
    let htmlEnd = bestSpan.end;

    // Expand start
    while (htmlStart > 0 && html[htmlStart] !== '<') htmlStart--;

    // Make sure we're not starting on a closing tag
    if (html.slice(htmlStart, htmlStart + 2) === '</') {
        // Move back to find the previous tag
        htmlStart--;
        while (htmlStart > 0 && html[htmlStart] !== '<') htmlStart--;
    }

    // Expand end
    while (htmlEnd < html.length && html[htmlEnd] !== '>') htmlEnd++;
    htmlEnd++; // include the closing '>'

    // Now backtrack to the outermost tag that wraps all matched terms
    const wrapper = findMinimalTagWrapper(html, htmlStart, htmlEnd);
    if (!wrapper) return null;

    // Attempt to include an <img> tag that is shortly after the snippet
    const postSnippet = html.slice(wrapper.end, wrapper.end + 200); // Look ahead 200 chars
    const imgMatch = postSnippet.match(/<img\b[^>]*?>/i);

    let snippit
    if (imgMatch) {
        const imgStart = wrapper.end + imgMatch.index;
        const imgEnd = imgStart + imgMatch[0].length;
        snippet = html.slice(wrapper.start, imgEnd);
    } else {
        snippet = html.slice(wrapper.start, wrapper.end);
    }

    // Highlight one instance of each term
    for (const term of lowerTerms) {
        const regex = new RegExp(`(${escapeRegExp(term)})`, 'i');
        snippet = snippet.replace(regex, `<span class="result_highlight">$1</span>`);
    }

    snippet = balanceTags(snippet);

    return (wrapper.start > 0 ? '...' : '') + snippet.replace(/^[^a-z0-9<]*|[^a-z0-9>]*$/gi, '') + (wrapper.end < html.length ? '...' : '');
}

function balanceTags(html) {
    const tagPattern = /<\/?([a-zA-Z0-9\-]+)(\s[^>]*)?>/g;
    const selfClosing = new Set(['br', 'hr', 'img', 'input', 'meta', 'link']);
    const stack = [];

    let match;
    while ((match = tagPattern.exec(html))) {
        const [fullTag, tagName] = match;
        const isClosing = fullTag.startsWith('</');

        if (selfClosing.has(tagName)) continue;

        if (isClosing) {
            if (stack.length && stack[stack.length - 1] === tagName) {
                stack.pop();
            } else {
                // Ignore unmatched closing tag
            }
        } else {
            stack.push(tagName);
        }
    }

    // Close any still-open tags
    while (stack.length) {
        const tag = stack.pop();
        html += `</${tag}>`;
    }

    return html;
}

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Finds the smallest tag block that wraps the content between start and end
function findMinimalTagWrapper(html, start, end) {
    const tagPattern = /<\/?([a-zA-Z0-9\-]+)(\s[^>]*)?>/g;
    const stack = [];
    let openTags = [];

    for (let i = start; i < end; i++) {
        tagPattern.lastIndex = i;
        const match = tagPattern.exec(html);
        if (!match || match.index >= end) break;

        const [tag, tagName] = match;
        const tagIndex = match.index;

        if (tag.startsWith('</')) {
            if (stack.length && stack[stack.length - 1].tag === tagName) {
                const openTag = stack.pop();
                openTags.push({ name: tagName, start: openTag.index, end: tagIndex + tag.length });
            }
        } else if (!tag.endsWith('/>')) {
            stack.push({ tag: tagName, index: tagIndex });
        }

        i = match.index + tag.length - 1;
    }

    if (openTags.length === 0) return { start, end };

    // Separate block and inline tags
    const inlineTags = new Set(['b', 'i', 'span', 'u', 'small', 'strong', 'em']);
    const blockWrappers = openTags.filter(tag => !inlineTags.has(tag.name.toLowerCase()));
    const allWrappers = [...blockWrappers, ...openTags]; // fallback to inline if no block found

    // Pick the smallest wrapper that covers the span
    allWrappers.sort((a, b) => (a.end - a.start) - (b.end - b.start));
    for (const tag of allWrappers) {
        if (tag.start <= start && tag.end >= end) {
            return { start: tag.start, end: tag.end };
        }
    }

    return { start, end };
}



function show_card(id){
    closeAll(true,false)
    document.getElementById(id).scrollIntoView({alignToTop:true,behavior:"smooth"})
    $(".ghost_card").removeClass("result_focus")
    let cards = document.getElementsByClassName("ghost_card")
    Array.from(cards).forEach((card) => {
        if(card.id != id)
            $(card).addClass("result_focus")
    })
}

function parse_card(elem,queries,is_title=false){

    let card_id = elem.id

    if(!is_title){
        let title = elem.getElementsByClassName("ghost_name")[0].innerText
        let results = `<div class="search_result" onclick="show_card('${card_id}')"><div class="result_title">${title}<span class="result_location_card"> (${lang_data["{{ghost_card}}"]})</span></div><div class="result_preview">`

        let list_items = elem.getElementsByClassName("ghost_behavior")[0].querySelectorAll('li');
        let num_items = 0
        let parts = ""
        list_items.forEach(item => {
            if (num_items < 5 && all_match(item.innerText.toLowerCase(),queries)) {
                let shtxt = shrink_text(item.innerText,queries).trim()
                if(!shtxt)
                    return
                parts += `<div class="result_part">${shtxt}</div>`
                num_items += 1
            }
        });
        if (!parts)
            return ''

        results += parts + `</div><div class="click_more">${lang_data["{{see_more}}"]}</div></div><hr>`
        
        return results
    }
    else{
        let title = elem.getElementsByClassName("ghost_name")[0].innerText
        let preview = shrink_text(title,queries)
        
        return `<div class="search_result" onclick="show_card('${card_id}')"><div class="result_title">${title}<span class="result_location_card"> (${lang_data["{{ghost_card}}"]})</span></div><div class="result_preview"><div class="result_part">${preview}</div></div><div class="click_more">${lang_data["{{see_more}}"]}</div></div><hr>`
    }
}

function getLeafMatchesBreadthFirst(elem, queries) {
    const queue = [elem];
    const result = [];

    while (queue.length > 0) {
        const node = queue.shift();

        // Skip <b> and <i> tags entirely
        if (node.tagName && ['B', 'I'].includes(node.tagName)) continue;

        // Skip if any child matches — we only want leaf matches
        let childHasMatch = false;

        for (let child of node.children) {
            if (['B', 'I'].includes(child.tagName)) continue;

            if (all_match(child.innerText.toLowerCase(), queries)) {
                childHasMatch = true;
                queue.push(child);
            }
        }

        if (!childHasMatch && all_match(node.innerText.toLowerCase(), queries)) {
            result.push(node);
        }
    }

    return result;
}

function findMisContainerHTML(elem) {
    let current = elem;
    while (current) {
        if (current.classList && current.classList.contains("mis")) {
            return current;
        }
        current = current.parentElement;
    }
    return null;
}

function cleanMis(html, searchTerms) {
    const lowerTerms = searchTerms.map(term => term.toLowerCase());

    html = html.replace(/<img\b[^>]*>/gi, '');
    html = html.replace(/\sclass="[^"]*"/gi, '');

    html = html.replace(/<h3\b[^>]*>/gi, '<div style="margin-top:15px;"><b>');
    html = html.replace('<div style="margin-top:15px;">','<div>')
    html = html.replace(/<\/h3>/gi, '</b></div>');


    // Highlight one instance of each term
    for (const term of lowerTerms) {
        const regex = new RegExp(`(${escapeRegExp(term)})`, 'i');
        html = html.replace(regex, `<span class="result_highlight">$1</span>`);
    }

    return html;
}

function parse_wiki(elem, queries){

    let prev_elem = elem.previousElementSibling
    let title = prev_elem.innerText.replace(/[^\p{L}\p{N}\s()\[\]{}\-\+]/gu, '').trim();
    let wiki_path = prev_elem.id.replace("wiki-","")
    
    while (prev_elem.innerText.includes("└") || prev_elem.innerText.includes("├")){
        prev_elem = prev_elem.parentElement.previousElementSibling
        title = prev_elem.innerText.replace(/[^\p{L}\p{N}\s()\[\]{}\-\+]/gu, '') + " >> " + title
        wiki_path = prev_elem.id.replace("wiki-","") + "." + wiki_path
    }

    let results
    if (title.includes(lang_data['{{misconceptions}}'].replace(/[^\p{L}\p{N}\s()\[\]{}\-\+]/gu, '').trim())){
        
        let list_items = getLeafMatchesBreadthFirst(elem, queries);
        let num_items = 0
        let added = new Set()

        results = ""
        list_items.forEach(item => {
            const misHTML = findMisContainerHTML(item);

            if(added.has(misHTML) || item.tagName == "H3"){
                return
            }

            let final_elem = item.parentElement.parentElement
            while(!final_elem.id.includes("wiki-")){
                final_elem = final_elem.previousElementSibling
                if(!final_elem)
                    return
            }

            let final_path = wiki_path + "." + final_elem.id.replace("wiki-","")
            let final_title = title + " >> " + final_elem.innerText.replace(/[^\p{L}\p{N}\s()\[\]{}\-\+]/gu, '')

            if (misHTML && num_items < 5) {
                let parsed_data = cleanMis(misHTML.innerHTML,queries)
                if(!parsed_data.trim())
                    return
                results += `<div class="search_result" onclick="$('.ghost_card').removeClass('result_focus');openWikiPath('${final_path}')"><div class="result_title">${final_title}<span class="result_location_misconception"> (${lang_data["{{misconceptions}}"]})</span></div><div class="result_preview">`
                results += `<div class="result_part">${parsed_data}</div>`
                results += `</div><div class="click_more">${lang_data["{{see_more}}"]}</div></div><hr>`
                num_items += 1
            }

            added.add(misHTML)

            
        });
    }
    else {
        results = `<div class="search_result" onclick="$('.ghost_card').removeClass('result_focus');openWikiPath('${wiki_path}')"><div class="result_title">${title}<span class="result_location_guide"> (${lang_data["{{guides}}"]})</span></div><div class="result_preview">`

        // Title
        if(all_match(title.toLowerCase(),queries))
            results += `<div class="result_part">${shrink_text(title,queries)}</div>`

        let list_items = getLeafMatchesBreadthFirst(elem, queries);
        let num_items = 0
        let added = new Set()
        list_items.forEach(item => {
            let skip = false
            let parent = item.parentElement

            while (parent){
                if(added.has(parent)){
                    skip = true
                    break
                }

                parent = parent.parentElement
            }

            if(skip) return

            if (num_items < 5 && all_match(item.innerText.toLowerCase(),queries)) {
                results += `<div class="result_part">${shrink_text(item.innerHTML,queries)}</div>`
                num_items += 1
            }

            added.add(item)
        });
        results += `</div><div class="click_more">${lang_data["{{see_more}}"]}</div></div><hr>`
    }

    

    return results
}

function parse_event(elem, queries){
    let title = document.getElementById("event_title").innerText
    let list_items = elem.querySelectorAll("*");
    let results = ""

    list_items.forEach(item => {
        if (all_match(item.innerText.toLowerCase(),queries)) {
            let preview = `<div class="result_part">${shrink_text(item.innerText.toLowerCase(),queries)}</div>`
            results += `<div class="search_result" onclick="$('.ghost_card').removeClass('result_focus');showEvent(true)"><div class="result_title">${title}<span class="result_location_event"> (${lang_data["{{current_event}}"]})</span></div><div class="result_preview">${preview}</div><div class="click_more">${lang_data["{{see_more}}"]}</div></div><hr>`
        }
    });

    return results
}