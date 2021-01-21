# Whatsapp Downloader

This web extension scrolls to the top of a WhatsApp chat and downloads all messages as a JSON in the following format:

```
{
    "title": "+55 11 98551-6777",
    "messages": [
        {
            "sender": "+55 11 98551-6777",
            "date": "31/12/2020",
            "time": "12:12",
            "text": "Hi",
            "image": null,
            "audio": null,
            "video": null,
            "isDeleted": false,
            "isForwarded": false,
            "quote": null
        },
        {
            "sender": "You",
            "date": "31/12/2020",
            "time": "12:13",
            "text": "Hi back, this is a blank image",
            "image": "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=",
            "audio": null,
            "video": null,
            "isDeleted": false,
            "isForwarded": false,
            "quote": {
                "sender": "+55 11 98551-6777",
                "date": "31/12/2020",
                "time": "12:12",
                "text": "Hi",
                "image": null,
                "audio": null,
                "video": null,
                "isDeleted": false,
                "isForwarded": false,
                "quote": null
            }
        }
    ]
}
```

## Format Notes

- The `image` message attribute is composed of an image in base64 format.
<!-- - The datetime format is ISO-8601 -->

<!-- ### Known issues -->

## To do

- [ ] download media
  - [x] download images
  - [ ] download videos
  - [ ] download audio
- [ ] include emojis
- [ ] use ISO-8601 for dates
- [ ] compress output
- [ ] sign/distribute
- [ ] WhatsApp UI version check
- [ ] pop-up to checkbox what media should be downloaded
