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
      type: 'date',
      options: {
        dateFormat: 'YYYY-MM-DD',
        calendarTodayLabel: 'Today'
      }
    },
    {
      name: 'photos',
      title: 'Photos',
      type: 'array', // This is what allows multiple selections!
      of: [{ type: 'image' }],
      options: {
        layout: 'grid'
      }
    }
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      media: 'photos.0'
    },
    prepare(selection) {
      const { title, date, media } = selection
      return {
        title: title,
        subtitle: date,
        media: media
      }
    }
  }
}