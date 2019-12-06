---
title: "Принятые определения"
description: "Страница с принятыми определениями."
meta:
  scripts:
    - neat_table
---

{% assign edit_link = "https://github.com/Sasha-Sorokin/mastodon-ru/edit/gh-pages/_data/terms.csv" %}

{% capture empty_info %}
Вы можете помочь определить список терминов, [отредактировав файл `_data/terms.csv`]({{ edit_link }}).
{% endcapture %}

{% capture auto_generated %}
Вы можете дополнить список терминов, [отредактировав файл `_data/terms.csv`]({{ edit_link }}).
{% endcapture %}

<!-- {% include note.html type="information" title="Эта страница генерируется автоматически" content=auto_generated %} -->

{% include note.html type="warning" title="Эта страница не заполнена." content=empty_info %}

На этой странице перечислены основные принятые определения. Большинство определений можно найти на самом Crowdin, данный список является выдержкой главных из них.

{% capture sel %}
<sup style="color: red"><dfn title="Выборочно от контекста">выб.</dfn></sup>
{% endcapture %}

<table>
  <thead>
    <tr>
      <th style="text-align: center">Определение</th>
      <th style="text-align: center">Часть речи</th>
      <th style="text-align: center">Контекст</th>
      <th style="text-align: center">Переводить как</th>
      <th style="text-align: center">Ошибочный перевод</th>
      <th style="text-align: center">Пример</th>
    </tr>
  </thead>
  <tbody>
    {% for term in site.data.terms %}
    {% assign form_def = site.data.terms_leg[term.form] %}
    <tr>
      <td>{{ term.definition }}</td>
      <td>{% if form_def %}<dfn title="{{ form_def }}">{{ term.form }}</dfn>{% else %}{{ term.form }}{% endif %}</td>
      <td>{% if term.context %}{{ term.context }}{% else %}&nbsp;{% endif %}</td>
      <td>{{ term.translation | replace: '[sel]', sel }}</td>
      <td>{{ term.wrong_translation }}</td>
      <td>{{ term.example }}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>


<style>
  article.main-content { max-width: 80% !important; width: auto; }
</style>
