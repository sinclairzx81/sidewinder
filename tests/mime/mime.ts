import { Assert } from '../assert/index'
import { Mime } from '@sidewinder/mime'

describe('mime/Mime', () => {
  it('Should return expected mime types', () => {
    Assert.equal(Mime.lookup('file.png'), 'image/png')
    Assert.equal(Mime.lookup('file.mp4'), 'video/mp4')
    Assert.equal(Mime.lookup('file.txt'), 'text/plain')
    Assert.equal(Mime.lookup('file.json'), 'application/json')
    Assert.equal(Mime.lookup('file.xml'), 'application/xml')
  })

  it('Should return application octet-stream for unknown', () => {
    Assert.equal(Mime.lookup('file.unknown'), 'application/octet-stream')
  })
})
