# n8n-nodes-treffer

Find verified work emails of people at German companies, right inside your n8n workflows.

[Treffer](https://treffer.io/api/email-finder/?utm_source=github&utm_medium=integration&utm_campaign=n8n) is an email finder built for Germany. Send a name and a company, get back a work email checked at the mail server, with its deliverability status. You only pay when we find an email.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) · [Usage](#usage) · [Example workflows](#example-workflows) · [Compatibility](#compatibility) · [Resources](#resources)

## Why Treffer for German contacts

- **Müller stays Müller.** Umlauts, ß and double surnames resolve the way German mail servers actually spell them.
- **Deep Mittelstand coverage.** We reach the 80-employee machine builder in Gütersloh, not just the companies every database has.
- **Catch-all domains resolved.** About a third of B2B domains accept any address. We resolve them instead of guessing.
- **Misses are free.** 1 credit per found email, nothing for a miss.

## Installation

The node is verified by n8n and works on n8n Cloud and self-hosted. Search for "Treffer" or "German email finder" in the nodes panel, pick it under **More from the community** and select **Install**. Instance owners and admins can install it, then everyone on the instance can use it. See n8n's [verified node installation guide](https://docs.n8n.io/integrations/community-nodes/installation/verified-install/).

**Self-hosted n8n**, alternatively: go to **Settings > Community Nodes > Install**, enter `n8n-nodes-treffer` and confirm.

## Credentials

1. [Sign up at Treffer](https://treffer.io/accounts/signup/?utm_source=github&utm_medium=integration&utm_campaign=n8n). No credit card needed to start.
2. Open [API keys](https://treffer.io/app/api-keys/?utm_source=github&utm_medium=integration&utm_campaign=n8n) in your dashboard and create a key.
3. In n8n, create a **Treffer API** credential and paste the key. n8n checks it with a free call.

## Operations

| Resource | Operation | Cost |
| --- | --- | --- |
| Email | Find a work email | 1 credit per found email, 0 for a miss |
| Account | Get the credit balance | Free |

## Usage

### Inputs

| Field | Notes |
| --- | --- |
| First Name and Last Name, or Full Name | Pick the format your data has with **Name Format**. |
| Company Domain | Gives the most reliable match, e.g. `example.com`. |
| Company Name | Use it when you have no domain. You can also send both. |

Map the fields from previous nodes with expressions, e.g. `{{ $json.first_name }}`.

### Output

```json
{
  "found": true,
  "credits_consumed": 1,
  "message": "Found max.mustermann@example.com.",
  "email": "max.mustermann@example.com",
  "deliverability": "valid"
}
```

- `deliverability` is `valid` when the mail server confirmed the exact address, `catch_all` when the domain accepts any address and we resolved the most likely one.
- `message` is for humans and can change. Branch on `found`, not on the message.

### Tips

- **A miss is not an error.** You get `found: false` and pay nothing. Add an **If** node on `found` to route misses, for example to another provider.
- **Lookups can take up to 90 seconds** when we verify live. The node waits up to 100 seconds per item.
- **Large lists run on their own.** The node runs 5 lookups in parallel, and when you hit the rate limit (120 email lookups per minute per key) or a lookup is temporarily unavailable, it waits and retries by itself.
- **Leave Retry On Fail off.** n8n's setting reruns every item of the node, so emails that were already found would be charged again.
- **Keep going on bad rows:** set **On Error** to **Continue (using error output)** so a row without a name or company does not stop the whole run.
- **AI agents:** the node works as a tool. Attach it to an AI Agent and let the agent look up emails on its own.

## Example workflows

Import them in n8n with **Import from File** and select your Treffer credential.

- [`find-work-emails-google-sheets.json`](examples/find-work-emails-google-sheets.json) fills the email column of a Google Sheet. It skips rows that already have an email, so you never pay twice for the same contact.
- [`find-work-emails.json`](examples/find-work-emails.json) runs two sample contacts through the email finder and splits found and missed emails. A quick way to see the node in action before connecting your own data.

## Compatibility

Tested with n8n 2.43.

## Resources

- [Email finder](https://treffer.io/api/email-finder/?utm_source=github&utm_medium=integration&utm_campaign=n8n)
- [API docs](https://treffer.io/docs/?utm_source=github&utm_medium=integration&utm_campaign=n8n)
- [Pricing](https://treffer.io/pricing/?utm_source=github&utm_medium=integration&utm_campaign=n8n)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## License

[MIT](LICENSE.md)
