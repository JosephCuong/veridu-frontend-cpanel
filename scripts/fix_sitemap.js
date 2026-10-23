const fs = require('fs');

const path = 'src/app/sitemap.ts';
let code = fs.readFileSync(path, 'utf8');

// Ensure storybooks, characters, courses only select existing columns
code = code.replace(
  /\.from\('storybooks'\)[\s\S]*?\.select\('slug, title_en, updated_at, created_at'\)/,
  `.from('storybooks')\n      .select('slug, updated_at, created_at')`
);

code = code.replace(
  /\.from\('characters'\)[\s\S]*?\.select\('slug, title_en, updated_at, created_at'\)/,
  `.from('characters')\n      .select('slug, updated_at, created_at')`
);

code = code.replace(
  /\.from\('courses'\)[\s\S]*?\.select\('slug, title_en, updated_at, created_at'\)/,
  `.from('courses')\n      .select('slug, updated_at, created_at')`
);

// Add English routes to posts in sitemap
const targetPostLoop = `        dynamicRoutes.push({
          url: \`\${baseUrl}/\${post.slug}\`,
          lastModified: new Date(post.updated_at || post.created_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.8,
        });`;

const replacementPostLoop = `        dynamicRoutes.push({
          url: \`\${baseUrl}/\${post.slug}\`,
          lastModified: new Date(post.updated_at || post.created_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.8,
        });

        // Dual-Slug SEO: Add English canonical URL to sitemap if title_en exists
        if (post.title_en && typeof post.title_en === 'string' && post.title_en.trim()) {
          const enSlug = slugify(post.title_en);
          if (enSlug) {
            dynamicRoutes.push({
              url: \`\${baseUrl}/en/\${enSlug}\`,
              lastModified: new Date(post.updated_at || post.created_at || Date.now()),
              changeFrequency: 'weekly',
              priority: 0.85,
            });
          }
        }`;

if (code.includes(targetPostLoop)) {
  code = code.replace(targetPostLoop, replacementPostLoop);
  console.log('✓ Successfully injected English dynamic routes into sitemap!');
} else {
  console.log('Target post loop not matched by exact text, trying regex...');
  code = code.replace(
    /dynamicRoutes\.push\(\{\s+url:\s+`\$\{baseUrl\}\/\$\{post\.slug\}`[\s\S]*?priority:\s+0\.8,\s+\}\);/,
    replacementPostLoop
  );
  console.log('✓ Replaced via regex!');
}

fs.writeFileSync(path, code);
console.log('✓ Finished updating sitemap.ts');
