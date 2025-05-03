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

    if (search_query.length > 1) {
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
                        if (all_match(entryText,terms)) {
                            results += parse_wiki(entry, terms);
                            matched.add(entry)
                        } 
                        else if (all_match(titleText,terms)) {
                            results += parse_wiki(entry.previousElementSibling, terms, true);
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

function shrink_text(html, searchTerms, contextLength = 80) {
    const tagRegex = /<\/?[^>]+>/g;

    // Strip tags to get raw text content and track positions
    let plainText = '';
    let indexMap = []; // Maps plainText index → HTML index
    let lastIndex = 0;

    for (let match of html.matchAll(tagRegex)) {
        const tagStart = match.index;
        const tagEnd = match.index + match[0].length;

        // Append text between tags
        const textSegment = html.slice(lastIndex, tagStart);
        plainText += textSegment;
        for (let i = 0; i < textSegment.length; i++) {
            indexMap.push(lastIndex + i);
        }

        lastIndex = tagEnd;
    }

    // Add remaining text after last tag
    const trailingText = html.slice(lastIndex);
    plainText += trailingText;
    for (let i = 0; i < trailingText.length; i++) {
        indexMap.push(lastIndex + i);
    }

    const lowerText = plainText.toLowerCase();

    // Find all term positions
    const positions = [];
    searchTerms.forEach(term => {
        const lowerTerm = term.toLowerCase();
        let idx = lowerText.indexOf(lowerTerm);
        while (idx !== -1) {
            positions.push({ term, index: idx });
            idx = lowerText.indexOf(lowerTerm, idx + 1);
        }
    });

    if (positions.length === 0) return null;

    // If only one term matched
    if (positions.length === 1 || searchTerms.length === 1) {
        const { index, term } = positions[0];
        const start = Math.max(0, index - contextLength);
        const end = Math.min(plainText.length, index + term.length + contextLength);
        return safelyExtractHTML(html, indexMap, start, end, [term]);
    }

    // Find closest pair
    // Find smallest window containing at least one of each unique search term
    const termSet = new Set(searchTerms.map(term => term.toLowerCase()));
    let termOccurrences = {};

    positions.sort((a, b) => a.index - b.index);
    let left = 0, right = 0, bestRange = null;

    while (right < positions.length) {
        termOccurrences[positions[right].term.toLowerCase()] = (termOccurrences[positions[right].term.toLowerCase()] || 0) + 1;

        while (Object.keys(termOccurrences).length === termSet.size) {
            const startIdx = positions[left].index;
            const endIdx = positions[right].index + positions[right].term.length;
            if (!bestRange || (endIdx - startIdx) < (bestRange.end - bestRange.start)) {
                bestRange = {
                    start: startIdx,
                    end: endIdx
                };
            }

            // Slide left window edge
            const leftTerm = positions[left].term.toLowerCase();
            termOccurrences[leftTerm]--;
            if (termOccurrences[leftTerm] === 0) {
                delete termOccurrences[leftTerm];
            }
            left++;
        }

        right++;
    }

    if (!bestRange) return null;

    const start = Math.max(0, bestRange.start - contextLength);
    const end = Math.min(plainText.length, bestRange.end + contextLength);

    return safelyExtractHTML(html, indexMap, start, end, searchTerms);
}

function safelyExtractHTML(html, indexMap, textStart, textEnd, highlightTerms) {
    const htmlStart = indexMap[textStart] || 0;
    const htmlEnd = indexMap[textEnd - 1] + 1 || html.length;

    let snippet = html.slice(htmlStart, htmlEnd);

    // Find the position of the first matched term in the snippet
    let firstMatchIndex = snippet.length;
    highlightTerms.forEach(term => {
        const regex = new RegExp(escapeRegExp(term), 'i');
        const match = regex.exec(snippet);
        if (match && match.index < firstMatchIndex) {
            firstMatchIndex = match.index;
        }
    });

    let before = snippet.slice(0, firstMatchIndex);
    let after = snippet.slice(firstMatchIndex);

    // Remove all <img> tags before the match
    before = before.replace(/<img\b[^>]*?>/gi, '');

    // Cut after the first <img> tag after match
    const imgAfterMatch = after.match(/<img\b[^>]*?>/i);
    if (imgAfterMatch) {
        const imgEndIndex = imgAfterMatch.index + imgAfterMatch[0].length;
        after = after.slice(0, imgEndIndex);
    }

    snippet = before + after;

    // Fix unclosed or broken tags
    snippet = fixUnclosedTags(snippet);

    // Add ellipsis if not full start or end
    if (htmlStart > 0) snippet = '...' + snippet;
    if (htmlEnd < html.length) snippet += '...';

    // Highlight terms
    highlightTerms.forEach(term => {
        const regex = new RegExp(escapeRegExp(term), 'i');
        snippet = snippet.replace(regex, match => `<span class="result_highlight">${match}</span>`);
    });

    return snippet;
}

function fixUnclosedTags(html) {
    const tagPattern = /<\/?([a-zA-Z0-9\-]+)(\s[^>]*)?>/g;
    const selfClosing = new Set(['br', 'hr', 'img', 'input', 'meta', 'link']);
    const stack = [];
    const result = [];

    let lastIndex = 0;
    for (const match of html.matchAll(tagPattern)) {
        const tag = match[0];
        const tagName = match[1].toLowerCase();
        const isClosing = tag.startsWith('</');

        result.push(html.slice(lastIndex, match.index));
        result.push(tag);
        lastIndex = match.index + tag.length;

        if (selfClosing.has(tagName)) continue;

        if (!isClosing) {
            stack.push(tagName);
        } else {
            const idx = stack.lastIndexOf(tagName);
            if (idx !== -1) {
                stack.splice(idx, 1); // Remove matched open tag
            } else {
                // Unmatched closing tag; drop it
                result.pop();
            }
        }
    }

    result.push(html.slice(lastIndex));

    // Close any remaining open tags
    while (stack.length > 0) {
        const openTag = stack.pop();
        result.push(`</${openTag}>`);
    }

    return result.join('');
}

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
        let preview = null
        let results = `<div class="search_result" onclick="show_card('${card_id}')"><div class="result_title">${title}<span class="result_location_card"> (Ghost Card)</span></div><div class="result_preview">`

        let list_items = elem.getElementsByClassName("ghost_behavior")[0].querySelectorAll('li');
        let num_items = 0
        list_items.forEach(item => {
            if (num_items < 5 && all_match(item.innerText.toLowerCase(),queries)) {
                results += `<div class="result_part">${shrink_text(item.innerText,queries)}</div>`
                num_items += 1
            }
        });
        results += `</div><div class="click_more">Click to see more >></div></div><hr>`
        
        return results
    }
    else{
        let title = elem.getElementsByClassName("ghost_name")[0].innerText
        let preview = shrink_text(title,queries)
        
        return `<div class="search_result" onclick="show_card('${card_id}')"><div class="result_title">${title}<span class="result_location_card"> (${lang_data["{{ghost_card}}"]})</span></div><div class="result_preview">${preview}</div><div class="click_more">${lang_data["{{see_more}}"]}</div></div><hr>`
    }
}

function parse_wiki(elem, queries, is_title=false){

    if (!is_title){
        let prev_elem = elem.previousElementSibling
        let title = prev_elem.innerText.replace(/[^a-z0-9\s()\[\]{}\-\+]/gi, '').trim();
        let wiki_path = prev_elem.id.replace("wiki-","")
        
        while (prev_elem.innerText.includes("└") || prev_elem.innerText.includes("├")){
            prev_elem = prev_elem.parentElement.previousElementSibling
            title = prev_elem.innerText.replace(/[^a-z0-9\s()\[\]{}\-\+]/gi, '') + " >> " + title
            wiki_path = prev_elem.id.replace("wiki-","") + "." + wiki_path
        }

        let results = `<div class="search_result" onclick="$('.ghost_card').removeClass('result_focus');openWikiPath('${wiki_path}')"><div class="result_title">${title}<span class="result_location_guide"> (${lang_data["{{guides}}"]})</span></div><div class="result_preview">`

        let list_items = elem.querySelectorAll("*")
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

        return results
    }
    else{
        let prev_elem = elem
        let title = prev_elem.innerText.replace(/[^a-z0-9\s()\[\]{}\-\+]/gi, '').trim();
        let wiki_path = prev_elem.id.replace("wiki-","")

        while (prev_elem.innerText.includes("└") || prev_elem.innerText.includes("├")){
            prev_elem = prev_elem.parentElement.previousElementSibling
            title = prev_elem.innerText.replace(/[^a-z0-9\s()\[\]{}\-\+]/gi, '') + " >> " + title
            wiki_path = prev_elem.id.replace("wiki-","") + "." + wiki_path
        }

        preview = `<div class="result_part">${shrink_text(title,queries)}</div>`

        return `<div class="search_result" onclick="$('.ghost_card').removeClass('result_focus');openWikiPath('${wiki_path}')"><div class="result_title">${title}<span class="result_location_guide"> (${lang_data["{{guides}}"]})</span></div><div class="result_preview">${preview}</div><div class="click_more">${lang_data["{{see_more}}"]}</div></div><hr>`
    }
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