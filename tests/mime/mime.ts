import { Assert } from '../assert/index'
import { Mime } from '@sidewinder/mime'

describe('mime/Mime', () => {
  it('should return expected mime types', () => {
    Assert.equal(Mime.get('file.png'), 'image/png')
    Assert.equal(Mime.get('file.mp4'), 'video/mp4')
    Assert.equal(Mime.get('file.txt'), 'text/plain')
    Assert.equal(Mime.get('file.json'), 'application/json')
    Assert.equal(Mime.get('file.xml'), 'application/xml')
  })

  it('should return application octet-stream for unknown', () => {
    Assert.equal(Mime.get('file.unknown'), 'application/octet-stream')
  })

  it('should set user defined mime type', () => {
    Mime.set('.customext', 'custom/ext')
    Assert.equal(Mime.get('app.customext'), 'custom/ext')
  })
})
