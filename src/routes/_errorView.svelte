<script lang="ts">
  export let error: { message: string, type: string };
</script>

<div>
  <div><b>{error.type}</b></div>
  <span>{error.message}</span>
</div>