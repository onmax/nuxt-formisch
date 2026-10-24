<template>
  <UApp>
    <UContainer class="max-w-3xl space-y-8 py-10">
      <header class="flex items-center justify-between">
        <NuxtLink
          to="/"
          class="text-lg font-semibold"
        >
          nuxt-formisch
        </NuxtLink>
        <nav class="flex gap-4 text-sm">
          <NuxtLink to="/">
            Form
          </NuxtLink>
          <NuxtLink to="/auto-form">
            AutoForm
          </NuxtLink>
          <a href="https://github.com/onmax/nuxt-formisch">GitHub</a>
        </nav>
      </header>
      <NuxtPage />
    </UContainer>
  </UApp>
</template>
