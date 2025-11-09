// Blog Loader - Fetches the latest blog entry from the RetroDECK Wiki repo
// and displays the preview on the homepage

let didLoad = false

async function findLatestBlogFile() {
    if (!didLoad) {
    try {
        // Month names and their numbers
        const monthNames = [
            'January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'
        ];
        
        const today = new Date();
        let currentYear = today.getFullYear();
        let currentMonth = today.getMonth(); // 0-indexed (0 = January, 11 = December)
        
        console.log(`Current date: ${today.toISOString()}, Year: ${currentYear}, Month index: ${currentMonth} (${monthNames[currentMonth]})`);
        
        // Try to find a blog post starting from current date going backwards
        // Loop through years (current year, then previous years)
        for (let yearOffset = 0; yearOffset <= 5; yearOffset++) {
            const searchYear = currentYear - yearOffset;
            
            // Determine which months to search
            let startMonth;
            if (yearOffset === 0) {
                // Current year: search from current month down to January
                startMonth = currentMonth;
            } else {
                // Previous years: search from December down to January
                startMonth = 11;
            }
            
            console.log(`Searching year ${searchYear}, starting from month index ${startMonth} (${monthNames[startMonth]})`);
            
            // Search months in descending order
            for (let monthIndex = startMonth; monthIndex >= 0; monthIndex--) {
                const monthName = monthNames[monthIndex];
                const fileName = `${monthName}-${searchYear}.md`;
                const filePath = `wiki-rtd/docs/blog/posts/${searchYear}/${fileName}`;
                
                console.log(`Trying: ${filePath}`);
                
                try {
                    const apiUrl = `https://api.github.com/repos/RetroDECK/Wiki/contents/${filePath}`;
                    const response = await fetch(apiUrl);
                    
                    if (response.ok) {
                        const fileData = await response.json();
                        console.log(`✅ Found: ${fileName}`);
                        didLoad = true;
                        return {
                            name: fileName,
                            path: filePath,
                            download_url: fileData.download_url,
                            year: searchYear,
                            month: monthIndex + 1,
                            monthName: monthName
                        };
                    }
                } catch (e) {
                    // File not found, continue to previous month
                    continue;
                }
            }
        }
        
        throw new Error('No blog files found in the last 5 years');
    } catch (error) {
        console.error('Error finding latest blog file:', error);
        return null;
    }
    }
}

async function loadLatestBlogEntry() {
    try {
        // Find the latest blog file dynamically
        const latestFile = await findLatestBlogFile();
        if (!latestFile) throw new Error('Could not find latest blog file');
        
        const rawUrl = latestFile.download_url;
        
        const response = await fetch(rawUrl);
        if (!response.ok) throw new Error('Failed to fetch blog post');
        
        const content = await response.text();
        
        // Extract the preview (content before <!-- more --> marker)
        const previewEnd = content.indexOf('<!-- more -->');
        if (previewEnd === -1) throw new Error('Preview marker not found');
        
        let preview = content.substring(0, previewEnd).trim();
        
        // Remove front matter (YAML between --- markers)
        const frontMatterEnd = preview.lastIndexOf('---');
        if (frontMatterEnd > 0) {
            preview = preview.substring(frontMatterEnd + 3).trim();
        }
        
        // Extract date from front matter
        const dateMatch = content.match(/date:\s*(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : '';
        
        // Convert markdown to HTML (simple conversion for basic formatting)
        const html = markdownToHtml(preview);
        
        // Extract title
        const titleMatch = preview.match(/^# (.+?)(?:\n|$)/);
        const title = titleMatch ? titleMatch[1] : 'Latest Blog Entry';
        
        // Get reading time from the markdown
        const readTimeMatch = preview.match(/(\d+)\s*min\s*read/i);
        const readTime = readTimeMatch ? readTimeMatch[0] : '';
        
        // Generate blog URL from date and title
        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const slug = title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-');
        const blogUrl = `https://retrodeck.readthedocs.io/en/latest/blog/${year}/${month}/${day}/${slug}/`;
        
        // Build the blog container HTML
        const container = document.getElementById('latest-blog-container');
        if (!container) throw new Error('Blog container not found');
        
        container.innerHTML = `
            <h3>${title}</h3>
            <div class="blog-preview">
                ${html}
            </div>
            <p><small>${date}${readTime ? ' • ' + readTime : ''}</small></p>
            <a href="${blogUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-dark btn-sm mt-2">Continue reading...</a>
        `;
        
    } catch (error) {
        console.error('Error loading blog entry:', error);
        const container = document.getElementById('latest-blog-container');
        if (container) {
            container.innerHTML = '<p>Unable to load latest blog entry.<br><a href="https://retrodeck.readthedocs.io/en/latest/blog/" target="_blank">View all blog posts</a></p>';
        }
    }
}

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
    let html = markdown;
    
    // Remove the main title (we display it separately)
    html = html.replace(/^# .+?\n/m, '');
    
    // Convert bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Convert italics
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Convert headings
    html = html.replace(/^### (.+?)$/gm, '<h5>$1</h5>');
    html = html.replace(/^## (.+?)$/gm, '<h4>$1</h4>');
    
    // Convert unordered lists
    html = html.replace(/^\- (.+?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
    html = html.replace(/<\/li>\n<li>/g, '</li>\n<li>');
    
    // Convert line breaks to paragraphs
    const paragraphs = html.split('\n\n').filter(p => p.trim());
    html = paragraphs.map(p => {
        p = p.trim();
        if (p.startsWith('<') || p.startsWith('<h') || p.startsWith('<ul')) {
            return p;
        }
        return `<p>${p}</p>`;
    }).join('\n');
    
    // Remove extra whitespace
    html = html.replace(/\n+/g, '\n');
    
    return html;
}

// Load blog entry when DOM is ready
document.addEventListener('DOMContentLoaded', loadLatestBlogEntry);
