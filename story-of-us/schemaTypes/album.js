// schemas/album.js
export default {
  name: 'album',
  title: 'Photo Album',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Event Title',
      type: 'string',
      description: 'e.g., "Museum Trip" or "Weekend Getaway"'
    },
    {
      name: 'date',
      title: 'Date',
      type: 'date'
    },
    {
      name: 'photos',
      title: 'Photos',
      type: 'array', // <--- This allows multiple items!
      of: [{ type: 'image' }],
      options: {
        layout: 'grid' // Shows them as a nice grid in the dashboard
      }
    }
  ]
}