var DATA = {
  "samples": {
    "basic": {
      "id": "basic",
      "desc": "Basic Monominoes usage with default Renders",
      "layout": {
        "elements": [{
          "path": "title",
          "render": Monominoes.renders.H2
        },{
          "path": "subtitle",
          "render": Monominoes.renders.P
        },{
          "path": "items",
          "elements": [{
            "path": "image",
            "render": Monominoes.renders.IMG({
              "source": "img",
              "height": "100px",
              "default-format": "png"
            })
          },{
            "path": "title",
            "render": Monominoes.renders.H3,
          },{
            "path": "subtitle",
            "render": Monominoes.renders.H5
          },{
            "path": "text",
            "render": Monominoes.renders.P
          }]
        }]
      },
      "data": {
        "title": "Basic example",
        "subtitle": "Using default renderers in an object with three sub-objects",
        "items": [
          {
            "title": "First item",
            "subtitle": "First item subtitle",
            "image": "sample-1",
            "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
          }, {
            "title": "Second item",
            "subtitle": "Second item subtitle",
            "image": "sample-2",
            "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
          }, {
            "title": "Third item",
            "subtitle": "Third item subtitle",
            "image": "sample-3",
            "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
          }
        ]
      }
    }
  }   
};