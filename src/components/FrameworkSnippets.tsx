import React, { useContext } from 'react';
import { Source, DocsContext } from '@storybook/blocks';

export const FrameworkSnippets = () => {
  const context = useContext(DocsContext);
  
  // Safe extraction of story values
  let args = {};
  
  if (context) {
      try {
        // Try to identify the primary story
        // In DocsContext, we might have access to componentStories via internal methods or via the storyId map
        const storyId = context.id || context.storyId || (context as any).primaryStory?.id;
        
        if (storyId) {
             const storyContext = context.getStoryContext(storyId);
             if (storyContext) {
                 args = storyContext.args;
             }
        } 
        
        // Fallback: If we couldn't resolve specific args, we might try to just show default logic or empty
        // However, messing with internal context can be fragile.
        // Let's try to get ANY attached story if the primary failed
        if (Object.keys(args).length === 0 && (context as any).componentStories) {
             const stories = (context as any).componentStories();
             if (stories && stories.length > 0) {
                 const firstStoryContext = context.getStoryContext(stories[0].id);
                 if (firstStoryContext) args = firstStoryContext.args;
             }
        }

      } catch (e) {
          console.warn('FrameworkSnippets: Could not resolve story context', e);
      }
  }

  // Helper to format props
  const formatProps = (framework: 'react' | 'angular' | 'blazor') => {
    const props = [];
    
    // Appearance - Always show
    props.push(framework === 'blazor' ? `Appearance="${args.appearance || 'filled'}"` : `appearance="${args.appearance || 'filled'}"`);

    // State - Always show
    props.push(framework === 'blazor' ? `State="${args.state || 'enabled'}"` : `state="${args.state || 'enabled'}"`);

    // Label - Always show
    props.push(framework === 'blazor' ? `Label="${args.label || 'Label'}"` : `label="${args.label || 'Label'}"`);

    // Icon & HasIcon - Always show
    const hasIcon = args.hasIcon || false;
    const iconName = args.icon || 'add';

    if (framework === 'angular') {
        props.push(`[hasIcon]="${hasIcon}"`);
        props.push(`icon="${iconName}"`);
    } else if (framework === 'blazor') {
        props.push(`HasIcon="${hasIcon}"`);
        props.push(`Icon="${iconName}"`);
    } else {
        props.push(`hasIcon={${hasIcon}}`);
        props.push(`icon="${iconName}"`);
    }
    
    // Href
    if (args.href) {
        props.push(framework === 'blazor' ? `Href="${args.href}"` : `href="${args.href}"`);
    }

    // Type
    if (args.type && args.type !== 'button') {
        props.push(framework === 'blazor' ? `Type="${args.type}"` : `type="${args.type}"`);
    }

    return props.join('\n    ');
  };

  const reactCode = `
import { KdsButton } from './wrappers/react/KdsButton';

<KdsButton 
    ${formatProps('react')}
    onKdsClick={(e) => console.log(e)} 
/>
`;

  const angularCode = `
import { KdsButtonComponent } from './wrappers/angular/kds-button.component';

@Component({
  imports: [KdsButtonComponent],
  template: \`
    <kds-button-ng 
        ${formatProps('angular')}
        (kds-click)="handleClick($event)">
    </kds-button-ng>
  \`
})
`;

  const blazorCode = `
<KdsButton 
    ${formatProps('blazor')}
    OnKdsClick="HandleClick" />
`;

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', marginTop: '20px' }}>
      <h3>React</h3>
      <Source language='tsx' code={reactCode.trim()} />
      
      <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #ddd' }} />
      
      <h3>Angular</h3>
      <Source language='typescript' code={angularCode.trim()} />

      <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #ddd' }} />

      <h3>Blazor</h3>
      <Source language='razor' code={blazorCode.trim()} />
    </div>
  );
};
