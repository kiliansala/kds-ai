# KDS Component Integration Guide

This guide details how to use KDS Web Components in Angular, React, and Blazor applications using the provided wrappers.

## React Integration

We provide a React wrapper that forwards refs and standardizes event handling.

### Setup

1. Copy `src/wrappers/react/KdsButton.tsx` to your project.
2. Import and use it like a native React component.

### Usage

```tsx
import { KdsButton } from "./components/KdsButton";

function App() {
  const handleClick = (e) => {
    console.log("Clicked!", e);
  };

  return (
    <KdsButton
      appearance="filled"
      label="Click Me"
      icon="check"
      onKdsClick={handleClick}
    />
  );
}
```

## Angular Integration

The Angular wrapper is a standalone component that manages property binding and event emission.

### Setup

1. Copy `src/wrappers/angular/kds-button.component.ts` to your project.
2. Import `KdsButtonComponent` in your module or standalone component imports.
3. Ensure custom elements schema is allowed if you use the raw web component elsewhere, but the wrapper handles the internal logic.

### Usage

```typescript
import { Component } from "@angular/core";
import { KdsButtonComponent } from "./components/kds-button.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [KdsButtonComponent],
  template: `
    <kds-button-ng
      appearance="filled"
      label="Angular Button"
      (kds-click)="handleClick($event)"
    >
    </kds-button-ng>
  `,
})
export class AppComponent {
  handleClick(event: CustomEvent) {
    console.log("Angular click", event);
  }
}
```

## Blazor Integration

The Blazor wrapper utilizes `IJSRuntime` implicitly via standard Blazor attributes modification and event mapping.

### Setup

1. Copy `src/wrappers/blazor/KdsButton.razor` to your project's shared components.
2. Ensure you have the main `kds-button.js` script loaded in your `index.html` or `_Layout.cshtml`.

### Usage

```razor
@page "/"

<KdsButton
    Appearance="filled"
    Label="Blazor Button"
    OnKdsClick="HandleClick" />

@code {
    private void HandleClick(MouseEventArgs e)
    {
        Console.WriteLine("Blazor clicked!");
    }
}
```
