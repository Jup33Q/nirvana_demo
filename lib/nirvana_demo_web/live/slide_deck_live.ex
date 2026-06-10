defmodule NirvanaDemoWeb.SlideDeckLive do
  use NirvanaDemoWeb, :live_view
  alias NirvanaDemo.Slides

  @impl true
  def mount(_params, _session, socket) do
    numbers = Slides.list_slide_numbers()

    {:ok,
     assign(socket,
       numbers: numbers,
       total: length(numbers),
       page_title: "Obsidian 涅槃手册",
       cursor_visible: false
     )}
  end

  @impl true
  def handle_params(params, _uri, socket) do
    numbers = socket.assigns.numbers
    cursor_visible = params["cursor"] in ["1", "true"]

    if is_nil(params["slide"]) do
      {:noreply,
       assign(socket,
         slide: nil,
         current: 0,
         current_number: nil,
         direction: 0,
         needs_cookie_redirect: true,
         cursor_visible: cursor_visible
       )}
    else
      current_number =
        case Integer.parse(params["slide"]) do
          {n, ""} -> if n in numbers, do: n, else: List.first(numbers) || 1
          _ -> List.first(numbers) || 1
        end

      slide = Slides.get_slide_by_number(current_number)
      current = Enum.find_index(numbers, &(&1 == current_number)) || 0

      {:noreply,
       assign(socket,
         slide: slide,
         current: current,
         current_number: current_number,
         direction: 0,
         needs_cookie_redirect: false,
         cursor_visible: cursor_visible
       )}
    end
  end

  @impl true
  def handle_event("navigate", %{"key" => key}, socket) do
    direction =
      case key do
        k when k in ["ArrowRight", "ArrowDown", " ", "PageDown"] -> 1
        k when k in ["ArrowLeft", "ArrowUp", "PageUp"] -> -1
        _ -> 0
      end

    navigate_slide(socket, direction)
  end

  @impl true
  def handle_event("next", _params, socket), do: navigate_slide(socket, 1)
  @impl true
  def handle_event("prev", _params, socket), do: navigate_slide(socket, -1)

  @impl true
  def handle_event("toggle_cursor", _params, socket) do
    new_visible = !socket.assigns.cursor_visible
    current_number = socket.assigns.current_number

    if current_number do
      {:noreply,
       socket
       |> assign(cursor_visible: new_visible)
       |> push_patch(to: ~p"/slides/#{current_number}?cursor=#{if new_visible, do: 1, else: 0}")}
    else
      {:noreply, assign(socket, cursor_visible: new_visible)}
    end
  end

  @impl true
  def handle_event("goto", %{"slide" => slide}, socket) do
    numbers = socket.assigns.numbers

    if slide in numbers do
      idx = Enum.find_index(numbers, &(&1 == slide))
      direction = if idx > socket.assigns.current, do: 1, else: -1
      cursor_query = if socket.assigns.cursor_visible, do: [cursor: 1], else: []

      {:noreply,
       socket
       |> assign(:direction, direction)
       |> push_event("slide_change", %{direction: direction})
       |> push_event("save_slide", %{number: slide})
       |> push_navigate(to: ~p"/slides/#{slide}?#{cursor_query}")}
    else
      {:noreply, socket}
    end
  end

  defp navigate_slide(socket, direction) when direction == 0 do
    {:noreply, socket}
  end

  defp navigate_slide(socket, direction) do
    numbers = socket.assigns.numbers
    current = socket.assigns.current
    new_idx = current + direction

    if new_idx >= 0 and new_idx < length(numbers) do
      new_number = Enum.at(numbers, new_idx)
      cursor_query = if socket.assigns.cursor_visible, do: [cursor: 1], else: []

      {:noreply,
       socket
       |> assign(:direction, direction)
       |> push_event("slide_change", %{direction: direction})
       |> push_event("save_slide", %{number: new_number})
       |> push_navigate(to: ~p"/slides/#{new_number}?#{cursor_query}")}
    else
      {:noreply, socket}
    end
  end
end
