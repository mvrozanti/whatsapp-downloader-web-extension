# Whatsapp Downloader

This web extension scrolls to the top of a WhatsApp chat and downloads it as a JSON in the following example:

```
{
    "title": "+55 11 98551-6777",
    "messages": [
        {
            "sender": "+55 11 98551-6777"
            "date": "31/12/2020",
            "time": "12:12",
            "text": "Hi",
            "images": [],
            "audio": null,
            "video": null,
            "isDeleted": false
            "isForwarded": false
            "quote": null
        },
        {
            "sender": "You"
            "date": "31/12/2020",
            "time": "12:13",
            "text": "Hi back",
            "images": [],
            "audio": null,
            "video": null,
            "isDeleted": false
            "isForwarded": false
            "quote": {
                "sender": "+55 11 98551-6777"
                "date": "31/12/2020",
                "time": "12:12",
                "text": "Hi",
                "images": [],
                "audio": null,
                "video": null,
                "isDeleted": false
                "isForwarded": false
                "quote": null
            }
        }
    ]
}
```

## Notes

- The `images` message attribute is composed of a collection of images in base64 format.

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

## Resources used
- https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/
- https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-sign
